/**
 * File Processing Utilities
 * Handles PDF text extraction and image compression
 */

import sharp from 'sharp'

/**
 * Extracts text content from a PDF buffer
 *
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<{ text: string; pageCount: number }>} Extracted text and page count
 */
export async function extractPDFText(pdfBuffer: Buffer): Promise<{ text: string; pageCount: number }> {
  try {
    // Dynamic import for pdf-parse (CommonJS module)
    const pdf = (await import('pdf-parse')).default
    const data = await pdf(pdfBuffer)

    return {
      text: data.text,
      pageCount: data.numpages
    }
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

/**
 * Compresses an image and returns the buffer
 *
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} options - Compression options
 * @returns {Promise<Buffer>} Compressed image buffer
 */
export async function compressImage(
  imageBuffer: Buffer,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  } = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 85,
    format = 'jpeg'
  } = options

  try {
    let pipeline = sharp(imageBuffer)

    // Get image metadata
    const metadata = await pipeline.metadata()

    // Resize if needed
    if (metadata.width && metadata.height) {
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
      }
    }

    // Convert and compress
    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true })
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality, compressionLevel: 9 })
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality })
    }

    return await pipeline.toBuffer()
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('Failed to compress image')
  }
}

/**
 * Creates a thumbnail from an image
 *
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {number} size - Thumbnail size (width and height)
 * @returns {Promise<Buffer>} Thumbnail buffer
 */
export async function createThumbnail(
  imageBuffer: Buffer,
  size: number = 200
): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer()
  } catch (error) {
    console.error('Error creating thumbnail:', error)
    throw new Error('Failed to create thumbnail')
  }
}

/**
 * Gets image dimensions
 *
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<{ width: number; height: number }>} Image dimensions
 */
export async function getImageDimensions(
  imageBuffer: Buffer
): Promise<{ width: number; height: number }> {
  try {
    const metadata = await sharp(imageBuffer).metadata()

    return {
      width: metadata.width || 0,
      height: metadata.height || 0
    }
  } catch (error) {
    console.error('Error getting image dimensions:', error)
    throw new Error('Failed to get image dimensions')
  }
}

/**
 * Validates file type
 *
 * @param {string} mimeType - File MIME type
 * @returns {boolean} True if file type is allowed
 */
export function isAllowedFileType(mimeType: string): boolean {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ]

  return allowed.includes(mimeType)
}

/**
 * Validates file size
 *
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes (default 10MB)
 * @returns {boolean} True if file size is within limits
 */
export function isValidFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSize
}

/**
 * Generates a safe filename
 *
 * @param {string} originalName - Original filename
 * @returns {string} Sanitized filename with timestamp
 */
export function generateSafeFilename(originalName: string): string {
  // Remove any path characters and sanitize
  const safeName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now()
  const extension = safeName.split('.').pop()
  const nameWithoutExt = safeName.replace(/\.[^/.]+$/, '')

  return `${timestamp}_${nameWithoutExt}.${extension}`
}

/**
 * Converts file to base64
 *
 * @param {Buffer} buffer - File buffer
 * @returns {string} Base64 encoded string
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64')
}
