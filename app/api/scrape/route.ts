/**
 * API Route: Web Scraping with Jina AI Reader
 * Scrapes web pages and creates attachments from the extracted content
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { createClient } from '@/lib/supabase/server'
import { createAttachment } from '@/lib/db/attachments'
import { generateSafeFilename } from '@/lib/utils/file-processing'

const JINA_READER_BASE_URL = 'https://r.jina.ai/'
const MAX_URLS_PER_REQUEST = 5

interface ScrapeRequest {
  urls: string[]
  conversation_id: string
  message_id?: string
}

/**
 * Validates if a string is a valid URL
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Generates a safe filename from a URL
 */
function generateFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace(/^www\./, '')
    const pathname = urlObj.pathname.replace(/\/$/, '').split('/').pop() || 'index'
    const safeName = `${hostname}-${pathname}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
    return `${safeName}.md`
  } catch {
    return `scraped-${Date.now()}.md`
  }
}

/**
 * Scrapes a single URL using Jina AI Reader
 */
async function scrapeUrl(url: string): Promise<{ content: string; title: string; error?: string }> {
  try {
    console.log('[WEB] Scraping URL with Jina AI:', url)

    const response = await fetch(`${JINA_READER_BASE_URL}${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'json'
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Limite de requêtes atteinte. Veuillez réessayer dans une minute.')
      }
      throw new Error(`Échec du scraping: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Jina AI returns data in this structure when Accept: application/json
    const content = data.data?.content || data.content || ''
    const title = data.data?.title || data.title || 'Page sans titre'

    if (!content) {
      throw new Error('Aucun contenu récupéré de la page')
    }

    console.log('[SUCCESS] Successfully scraped:', title)
    return { content, title }

  } catch (error) {
    console.error('[ERROR] Scraping error:', error)
    return {
      content: '',
      title: '',
      error: error instanceof Error ? error.message : 'Erreur inconnue lors du scraping'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getUserServer()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body: ScrapeRequest = await request.json()
    const { urls, conversation_id, message_id } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'URLs array is required' },
        { status: 400 }
      )
    }

    if (!conversation_id) {
      return NextResponse.json(
        { success: false, error: 'conversation_id is required' },
        { status: 400 }
      )
    }

    if (urls.length > MAX_URLS_PER_REQUEST) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_URLS_PER_REQUEST} URLs per request` },
        { status: 400 }
      )
    }

    // 3. Validate all URLs
    const invalidUrls = urls.filter(url => !isValidUrl(url))
    if (invalidUrls.length > 0) {
      return NextResponse.json(
        { success: false, error: `URLs invalides: ${invalidUrls.join(', ')}` },
        { status: 400 }
      )
    }

    // 4. Scrape all URLs
    console.log(`[START] Starting scrape for ${urls.length} URL(s)`)
    const scrapeResults = await Promise.all(urls.map(url => scrapeUrl(url)))

    // 5. Process successful scrapes and create attachments
    const supabase = await createClient()
    const attachments = []
    const errors = []

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      const result = scrapeResults[i]

      if (result.error || !result.content) {
        errors.push({ url, error: result.error || 'Aucun contenu récupéré' })
        continue
      }

      try {
        // Generate filename
        const fileName = generateFilenameFromUrl(url)
        const safeFilename = generateSafeFilename(fileName)

        // Create markdown content with metadata
        const markdownContent = `# ${result.title}

**Source:** ${url}
**Scrapé le:** ${new Date().toLocaleString('fr-FR')}

---

${result.content}
`

        // Convert to buffer
        const contentBuffer = Buffer.from(markdownContent, 'utf-8')

        // Upload to Supabase Storage
        const storagePath = `${user.id}/${conversation_id}/scraped/${safeFilename}`
        console.log('[UPLOAD] Uploading scraped content to storage:', storagePath)

        const { error: uploadError } = await supabase.storage
          .from('conversation-attachments')
          .upload(storagePath, contentBuffer, {
            contentType: 'text/plain',
            upsert: false
          })

        if (uploadError) {
          console.error('[ERROR] Storage upload error:', uploadError)
          errors.push({ url, error: 'Échec de l\'upload du fichier' })
          continue
        }

        // Create attachment record
        const attachmentResult = await createAttachment({
          conversation_id,
          message_id: message_id || undefined,
          user_id: user.id,
          file_name: fileName,
          file_type: 'text/plain',
          file_size: contentBuffer.length,
          storage_path: storagePath,
          extracted_text: result.content,
          metadata: {
            scraped: true,
            source_url: url,
            title: result.title,
            scraped_at: new Date().toISOString()
          }
        })

        if (!attachmentResult.success) {
          console.error('[ERROR] Failed to create attachment record:', attachmentResult.error)
          // Cleanup: delete uploaded file
          await supabase.storage
            .from('conversation-attachments')
            .remove([storagePath])
          errors.push({ url, error: 'Échec de la création de l\'attachment' })
          continue
        }

        // Generate signed URL
        const { data: urlData } = await supabase.storage
          .from('conversation-attachments')
          .createSignedUrl(storagePath, 3600)

        attachments.push({
          ...attachmentResult.data,
          signed_url: urlData?.signedUrl,
          url
        })

        console.log('[SUCCESS] Successfully created attachment for:', url)

      } catch (error) {
        console.error('[ERROR] Error processing scraped content:', error)
        errors.push({
          url,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    // 6. Return results
    if (attachments.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Échec du scraping de toutes les URLs',
          details: errors
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        attachments,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total: urls.length,
          succeeded: attachments.length,
          failed: errors.length
        }
      }
    })

  } catch (error) {
    console.error('Error in scrape API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
