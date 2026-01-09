'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { EventFormData } from '@/lib/types/event'
import { generateQRCode } from '@/lib/utils/qrcode'

export async function createEvent(data: EventFormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Generate unique QR code data
  const qrCodeData = `event-${Date.now()}-${Math.random().toString(36).substring(7)}`

  const { data: event, error } = await supabase
    .from('events')
    .insert([
      {
        title: data.title,
        description: data.description || null,
        event_type: data.event_type,
        location: data.location || null,
        location_details: data.location_details || null,
        is_virtual: data.is_virtual,
        virtual_link: data.virtual_link || null,
        starts_at: data.starts_at,
        ends_at: data.ends_at || null,
        max_attendees: data.max_attendees || null,
        qr_code_data: qrCodeData,
        created_by: user.id,
      },
    ])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/events')
  revalidatePath('/dashboard')
  return { success: true, event }
}

export async function updateEvent(id: string, data: EventFormData) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .update({
      title: data.title,
      description: data.description || null,
      event_type: data.event_type,
      location: data.location || null,
      location_details: data.location_details || null,
      is_virtual: data.is_virtual,
      virtual_link: data.virtual_link || null,
      starts_at: data.starts_at,
      ends_at: data.ends_at || null,
      max_attendees: data.max_attendees || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/events')
  revalidatePath('/dashboard')
  return { success: true, event }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/events')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleEventStatus(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/events')
  return { success: true }
}

export async function getEvents(params?: {
  upcoming?: boolean
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  const page = params?.page || 1
  const limit = params?.limit || 25
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('events')
    .select('*, event_checkins(count)', { count: 'exact' })

  // Filter for upcoming events if requested
  if (params?.upcoming) {
    query = query.gte('starts_at', new Date().toISOString())
  }

  // Order by start date
  query = query.order('starts_at', { ascending: false })

  // Apply pagination
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    return { error: error.message, data: null, count: 0 }
  }

  return { data, count, error: null }
}

export async function getEvent(id: string) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message, event: null }
  }

  return { event, error: null }
}

export async function checkInToEvent(eventId: string, memberId: string, method: 'qr' | 'manual' | 'link' = 'qr') {
  const supabase = await createClient()

  // Check if already checked in
  const { data: existing } = await supabase
    .from('event_checkins')
    .select('id')
    .eq('event_id', eventId)
    .eq('member_id', memberId)
    .single()

  if (existing) {
    return { error: 'Already checked in to this event' }
  }

  const { data: checkin, error } = await supabase
    .from('event_checkins')
    .insert([
      {
        event_id: eventId,
        member_id: memberId,
        check_in_method: method,
      },
    ])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/events/${eventId}`)
  return { success: true, checkin }
}

export async function getEventCheckins(eventId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_checkins')
    .select(
      `
      *,
      member:members(id, first_name, last_name, email, current_city)
    `
    )
    .eq('event_id', eventId)
    .order('checked_in_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}
