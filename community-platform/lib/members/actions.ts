'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { MemberFormData } from '@/lib/types/member'

export async function createMember(data: MemberFormData) {
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from('members')
    .insert([
      {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        current_city: data.current_city || null,
        phone: data.phone || null,
        linkedin_url: data.linkedin_url || null,
        years_with_te: data.years_with_te || null,
        bio: data.bio || null,
      },
    ])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/members')
  revalidatePath('/dashboard')
  return { success: true, member }
}

export async function updateMember(id: string, data: MemberFormData) {
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from('members')
    .update({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || null,
      current_city: data.current_city || null,
      phone: data.phone || null,
      linkedin_url: data.linkedin_url || null,
      years_with_te: data.years_with_te || null,
      bio: data.bio || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/members')
  revalidatePath('/dashboard')
  return { success: true, member }
}

export async function deleteMember(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('members').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/members')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getMembers(params?: {
  search?: string
  city?: string
  orderBy?: string
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  const page = params?.page || 1
  const limit = params?.limit || 25
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase.from('members').select('*', { count: 'exact' })

  // Apply search filter
  if (params?.search) {
    query = query.or(
      `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
    )
  }

  // Apply city filter
  if (params?.city) {
    query = query.eq('current_city', params.city)
  }

  // Apply ordering
  switch (params?.orderBy) {
    case 'name':
      query = query.order('first_name', { ascending: true })
      break
    case 'engagement':
      query = query.order('engagement_score', { ascending: false })
      break
    case 'support':
      query = query.order('support_score', { ascending: false })
      break
    case 'recent':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('first_name', { ascending: true })
  }

  // Apply pagination
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    return { error: error.message, data: null, count: 0 }
  }

  return { data, count, error: null }
}
