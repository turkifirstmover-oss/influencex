export type Platform = 'instagram' | 'tiktok' | 'snapchat' | 'youtube' | 'twitter'
export type Niche = 'lifestyle' | 'fashion' | 'tech' | 'auto' | 'sports' | 'food' | 'travel' | 'business'
export type Gender = 'male' | 'female'

export interface SocialAccount {
  id: string
  platform: Platform
  handle: string
  profile_url?: string
  followers: number
  avg_views: number
  engagement_rate: number
}

export interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail_url?: string
  caption?: string
  campaign_name?: string
}

export interface Influencer {
  id: string
  slug: string
  full_name: string
  handle?: string
  bio?: string
  avatar_url?: string
  cover_url?: string
  country: string
  city?: string
  gender?: Gender
  niche: Niche[]
  languages: string[]
  is_active: boolean
  is_verified: boolean
  is_featured: boolean
  profile_views: number
  created_at: string
  social_accounts?: SocialAccount[]
  media_items?: MediaItem[]
  brand_names?: string[]
  collab_types?: string[]
  total_followers?: number
  avg_engagement?: number
  avg_views?: number
}

export interface InfluencerFilters {
  search?: string
  platforms?: Platform[]
  niches?: Niche[]
  country?: string
  gender?: Gender
  min_followers?: number
  max_followers?: number
  min_engagement?: number
}

export interface ClientList {
  id: string
  token: string
  name: string
  description?: string
  is_active: boolean
  view_count: number
  created_at: string
}
