/**
 * Utility functions for handling Google Drive URLs
 */

export interface GoogleDriveUrlInfo {
  fileId: string | null
  isGoogleDriveUrl: boolean
  originalUrl: string
}

/**
 * Check if a URL is from Google Drive
 */
export function isGoogleDriveUrl(url?: string): boolean {
  if (!url) return false
  return url.includes('drive.google.com') || url.includes('docs.google.com')
}

/**
 * Extract file ID from various Google Drive URL formats
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!isGoogleDriveUrl(url)) return null

  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view
  const fileIdMatch1 = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
  if (fileIdMatch1) return fileIdMatch1[1]

  // Pattern 2: https://drive.google.com/uc?id=FILE_ID
  const fileIdMatch2 = url.match(/[?&]id=([a-zA-Z0-9-_]+)/)
  if (fileIdMatch2) return fileIdMatch2[1]

  // Pattern 3: https://drive.google.com/open?id=FILE_ID
  const fileIdMatch3 = url.match(/open\?id=([a-zA-Z0-9-_]+)/)
  if (fileIdMatch3) return fileIdMatch3[1]

  return null
}

/**
 * Convert Google Drive URL to direct download URL
 */
export function getGoogleDriveDownloadUrl(url: string): string {
  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) return url

  return `https://drive.google.com/uc?id=${fileId}&export=download`
}

/**
 * Convert Google Drive URL to thumbnail/preview URL
 */
export function getGoogleDriveThumbnailUrl(url: string, size = 800): string {
  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) return url

  return `https://lh3.googleusercontent.com/d/${fileId}=s${size}`
}

/**
 * Convert Google Drive URL to view URL (for embedding)
 */
export function getGoogleDriveViewUrl(url: string): string {
  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) return url

  return `https://drive.google.com/uc?id=${fileId}&export=view`
}

/**
 * Get optimized URL based on asset type
 */
export function getOptimizedGoogleDriveUrl(
  url: string, 
  assetType?: 'image' | 'video'
): string {
  if (!isGoogleDriveUrl(url)) return url

  switch (assetType) {
    case 'image':
      // For images, try thumbnail first, fallback to download
      try {
        return getGoogleDriveThumbnailUrl(url)
      } catch {
        return getGoogleDriveDownloadUrl(url)
      }
    
    case 'video':
      // For videos, use direct download
      return getGoogleDriveDownloadUrl(url)
    
    default:
      // Default to download URL
      return getGoogleDriveDownloadUrl(url)
  }
}

/**
 * Analyze Google Drive URL and return info
 */
export function analyzeGoogleDriveUrl(url?: string): GoogleDriveUrlInfo {
  const originalUrl = url || ''
  const isGDriveUrl = isGoogleDriveUrl(originalUrl)
  const fileId = isGDriveUrl ? extractGoogleDriveFileId(originalUrl) : null

  return {
    fileId,
    isGoogleDriveUrl: isGDriveUrl,
    originalUrl
  }
}