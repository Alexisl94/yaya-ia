/**
 * URL Detection Utilities
 * Utilities for detecting and extracting URLs from text
 */

/**
 * Regular expression to match URLs
 * Matches http:// and https:// URLs
 */
const URL_REGEX = /(https?:\/\/[^\s]+)/gi

/**
 * Detects if a string contains any URLs
 * @param text - The text to check for URLs
 * @returns true if the text contains at least one URL
 */
export function containsUrls(text: string): boolean {
  return URL_REGEX.test(text)
}

/**
 * Extracts all URLs from a string
 * @param text - The text to extract URLs from
 * @returns Array of unique URLs found in the text
 */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX)
  if (!matches) return []

  // Remove duplicates and clean URLs (remove trailing punctuation)
  return Array.from(new Set(
    matches.map(url => cleanUrl(url))
  ))
}

/**
 * Cleans a URL by removing trailing punctuation and common suffixes
 * @param url - The URL to clean
 * @returns The cleaned URL
 */
function cleanUrl(url: string): string {
  // Remove trailing punctuation (.,!?;:)
  return url.replace(/[.,!?;:]+$/, '')
}

/**
 * Validates if a string is a valid HTTP/HTTPS URL
 * @param urlString - The string to validate
 * @returns true if the string is a valid URL
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Filters an array of URLs to return only valid ones
 * @param urls - Array of URLs to filter
 * @returns Array of valid URLs
 */
export function filterValidUrls(urls: string[]): string[] {
  return urls.filter(isValidUrl)
}

/**
 * Extracts and validates URLs from text
 * @param text - The text to extract URLs from
 * @returns Array of valid, unique URLs
 */
export function extractValidUrls(text: string): string[] {
  const urls = extractUrls(text)
  return filterValidUrls(urls)
}

/**
 * Checks if text contains scrapeable URLs (not common file extensions)
 * @param text - The text to check
 * @returns true if text contains scrapeable URLs
 */
export function containsScrapeableUrls(text: string): boolean {
  const urls = extractValidUrls(text)

  // Filter out URLs that point to files we can't scrape
  const nonScrapeableExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.zip', '.mp4', '.mp3']

  return urls.some(url => {
    const lowercaseUrl = url.toLowerCase()
    return !nonScrapeableExtensions.some(ext => lowercaseUrl.endsWith(ext))
  })
}
