export function parseMediaUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  // Instagram post: https://www.instagram.com/p/ABC123/
  // Instagram reel: https://www.instagram.com/reel/ABC123/
  const instagramPostMatch = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/)
  const instagramReelMatch = url.match(/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/)
  
  if (instagramPostMatch) {
    return {
      type: 'instagram_post',
      identifier: instagramPostMatch[1],
      platform: 'instagram'
    }
  }

  if (instagramReelMatch) {
    return {
      type: 'instagram_reel',
      identifier: instagramReelMatch[1],
      platform: 'instagram'
    }
  }

  // YouTube: https://www.youtube.com/watch?v=ABC123 or https://youtu.be/ABC123
  const youtubeFullMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)
  const youtubeShortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  
  if (youtubeFullMatch) {
    return {
      type: 'youtube',
      identifier: youtubeFullMatch[1],
      platform: 'youtube'
    }
  }

  if (youtubeShortMatch) {
    return {
      type: 'youtube',
      identifier: youtubeShortMatch[1],
      platform: 'youtube'
    }
  }

  return null
}

export function getEmbedUrl(type, identifier) {
  switch (type) {
    case 'instagram_post':
    case 'instagram_reel':
      return `https://www.instagram.com/p/${identifier}/embed`
    
    case 'youtube':
      return `https://www.youtube.com/embed/${identifier}`
    
    default:
      return null
  }
}

export function isValidMediaUrl(url) {
  return parseMediaUrl(url) !== null
}

