/**
 * API Route: Web Search with SerpAPI
 * Performs web searches and creates attachments from the results
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { createClient } from '@/lib/supabase/server'
import { createAttachment } from '@/lib/db/attachments'

const SERPAPI_BASE_URL = 'https://serpapi.com/search'
const MAX_RESULTS = 10

interface WebSearchRequest {
  query: string
  numResults?: number
  conversation_id: string
  message_id?: string
}

interface SearchResult {
  position: number
  title: string
  link: string
  snippet: string
  source?: string
}

/**
 * Performs a web search using SerpAPI
 */
async function performWebSearch(query: string, numResults: number = 5): Promise<{
  results: SearchResult[]
  error?: string
}> {
  try {
    const apiKey = process.env.SERPAPI_API_KEY

    if (!apiKey) {
      throw new Error('SERPAPI_API_KEY non configurée. Ajoutez-la dans votre fichier .env.local')
    }

    console.log('[SEARCH] Performing web search for:', query)

    const url = new URL(SERPAPI_BASE_URL)
    url.searchParams.append('q', query)
    url.searchParams.append('api_key', apiKey)
    url.searchParams.append('engine', 'google')
    url.searchParams.append('num', Math.min(numResults, MAX_RESULTS).toString())
    url.searchParams.append('gl', 'fr') // France
    url.searchParams.append('hl', 'fr') // French

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Clé API SerpAPI invalide')
      }
      if (response.status === 429) {
        throw new Error('Limite de requêtes SerpAPI atteinte. Veuillez réessayer plus tard.')
      }
      throw new Error(`Échec de la recherche: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Extract organic results from SerpAPI response
    const organicResults = data.organic_results || []

    if (organicResults.length === 0) {
      throw new Error('Aucun résultat trouvé pour cette requête')
    }

    const results: SearchResult[] = organicResults.map((result: any, index: number) => ({
      position: index + 1,
      title: result.title || 'Sans titre',
      link: result.link || '',
      snippet: result.snippet || '',
      source: result.source || new URL(result.link).hostname,
    }))

    console.log(`[SUCCESS] Found ${results.length} search results`)
    return { results }

  } catch (error) {
    console.error('[ERROR] Web search error:', error)
    return {
      results: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la recherche'
    }
  }
}

/**
 * Formats search results into markdown content
 */
function formatSearchResults(query: string, results: SearchResult[]): string {
  const timestamp = new Date().toLocaleString('fr-FR')

  let markdown = `# Résultats de recherche : ${query}

**Recherché le:** ${timestamp}
**Nombre de résultats:** ${results.length}

---

`

  results.forEach((result, index) => {
    markdown += `## [${index + 1}] ${result.title}

**Source:** ${result.source || 'Non spécifiée'}
**URL:** ${result.link}

${result.snippet}

---

`
  })

  return markdown
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
    const body: WebSearchRequest = await request.json()
    const { query, numResults = 5, conversation_id, message_id } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      )
    }

    if (!conversation_id) {
      return NextResponse.json(
        { success: false, error: 'conversation_id is required' },
        { status: 400 }
      )
    }

    if (numResults > MAX_RESULTS) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_RESULTS} résultats autorisés` },
        { status: 400 }
      )
    }

    // 3. Perform web search
    console.log(`[START] Starting web search for: "${query}"`)
    const searchResult = await performWebSearch(query, numResults)

    if (searchResult.error || searchResult.results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: searchResult.error || 'Aucun résultat trouvé'
        },
        { status: 500 }
      )
    }

    // 4. Create markdown content
    const markdownContent = formatSearchResults(query, searchResult.results)
    const contentBuffer = Buffer.from(markdownContent, 'utf-8')

    // 5. Upload to Supabase Storage
    const supabase = await createClient()
    const timestamp = Date.now()
    const safeQuery = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)
    const fileName = `websearch-${safeQuery}-${timestamp}.md`
    const storagePath = `${user.id}/${conversation_id}/websearch/${fileName}`

    console.log('[UPLOAD] Uploading search results to storage:', storagePath)

    const { error: uploadError } = await supabase.storage
      .from('conversation-attachments')
      .upload(storagePath, contentBuffer, {
        contentType: 'text/plain',
        upsert: false
      })

    if (uploadError) {
      console.error('[ERROR] Storage upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Échec de l\'upload des résultats' },
        { status: 500 }
      )
    }

    // 6. Create attachment record
    const attachmentResult = await createAttachment({
      conversation_id,
      message_id: message_id || undefined,
      user_id: user.id,
      file_name: fileName,
      file_type: 'text/websearch',
      file_size: contentBuffer.length,
      storage_path: storagePath,
      extracted_text: markdownContent,
      metadata: {
        websearch: true,
        query,
        num_results: searchResult.results.length,
        search_engine: 'serpapi',
        searched_at: new Date().toISOString(),
        results: searchResult.results.map(r => ({
          title: r.title,
          link: r.link,
          snippet: r.snippet.substring(0, 200) // Truncate for metadata
        }))
      }
    })

    if (!attachmentResult.success) {
      console.error('[ERROR] Failed to create attachment record:', attachmentResult.error)
      // Cleanup: delete uploaded file
      await supabase.storage
        .from('conversation-attachments')
        .remove([storagePath])
      return NextResponse.json(
        { success: false, error: 'Échec de la création de l\'attachment' },
        { status: 500 }
      )
    }

    // 7. Generate signed URL
    const { data: urlData } = await supabase.storage
      .from('conversation-attachments')
      .createSignedUrl(storagePath, 3600)

    console.log('[SUCCESS] Successfully created web search attachment')

    // 8. Return results
    return NextResponse.json({
      success: true,
      data: {
        attachments: [{
          ...attachmentResult.data,
          signed_url: urlData?.signedUrl
        }],
        results: searchResult.results,
        summary: {
          query,
          total_results: searchResult.results.length,
          search_engine: 'SerpAPI (Google)'
        }
      }
    })

  } catch (error) {
    console.error('Error in websearch API:', error)
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
