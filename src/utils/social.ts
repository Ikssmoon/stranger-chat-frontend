export interface SocialPlatform {
  name: string
  pattern: RegExp
  icon: string
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { name: 'instagram', pattern: /instagram\.com/i,          icon: '/social/insta.svg' },
  { name: 'facebook',  pattern: /facebook\.com|fb\.com/i,   icon: '/social/fb.svg' },
  { name: 'telegram',  pattern: /t\.me|telegram\.me/i,      icon: '/social/telegram.svg' },
  { name: 'twitter',   pattern: /twitter\.com|x\.com/i,     icon: '/social/x.svg' },
  { name: 'gmail',     pattern: /gmail\.com/i,              icon: '/social/gmail.svg' },
]

export function detectSocialLink(text: string): SocialPlatform | null {
  for (const platform of SOCIAL_PLATFORMS) {
    if (platform.pattern.test(text)) return platform
  }
  return null
}
