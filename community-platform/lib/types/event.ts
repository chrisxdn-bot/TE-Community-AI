export interface Event {
  id: string
  title: string
  description: string | null
  event_type: 'meetup' | 'workshop' | 'webinar' | 'conference' | 'social' | 'other'
  location: string | null
  location_details: string | null
  is_virtual: boolean
  virtual_link: string | null
  starts_at: string
  ends_at: string | null
  max_attendees: number | null
  qr_code_data: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface EventFormData {
  title: string
  description?: string
  event_type: 'meetup' | 'workshop' | 'webinar' | 'conference' | 'social' | 'other'
  location?: string
  location_details?: string
  is_virtual: boolean
  virtual_link?: string
  starts_at: string
  ends_at?: string
  max_attendees?: number
}

export interface EventCheckin {
  id: string
  event_id: string
  member_id: string
  checked_in_at: string
  check_in_method: 'qr' | 'manual' | 'link' | 'auto'
  device_info: any
  notes: string | null
  created_at: string
}

export interface EventWithCheckins extends Event {
  checkin_count?: number
  is_checked_in?: boolean
}
