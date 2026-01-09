export interface Member {
  id: string
  email: string | null
  first_name: string
  last_name: string
  current_city: string | null
  phone: string | null
  linkedin_url: string | null
  years_with_te: number | null
  avatar_url: string | null
  bio: string | null
  is_admin: boolean
  is_active: boolean
  engagement_score: number
  support_score: number
  last_active_at: string | null
  created_at: string
  updated_at: string
}

export interface MemberFormData {
  first_name: string
  last_name: string
  email?: string
  current_city?: string
  phone?: string
  linkedin_url?: string
  years_with_te?: number
  bio?: string
}
