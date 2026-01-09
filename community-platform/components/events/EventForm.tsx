'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent, updateEvent } from '@/lib/events/actions'
import { Event } from '@/lib/types/event'

interface EventFormProps {
  event?: Event
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isVirtual, setIsVirtual] = useState(event?.is_virtual || false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      event_type: formData.get('event_type') as any,
      location: formData.get('location') as string,
      location_details: formData.get('location_details') as string,
      is_virtual: isVirtual,
      virtual_link: formData.get('virtual_link') as string,
      starts_at: formData.get('starts_at') as string,
      ends_at: formData.get('ends_at') as string,
      max_attendees: formData.get('max_attendees')
        ? parseInt(formData.get('max_attendees') as string)
        : undefined,
    }

    const result = event
      ? await updateEvent(event.id, data)
      : await createEvent(data)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/events')
    router.refresh()
  }

  // Format date for datetime-local input
  function formatDateForInput(dateString: string) {
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Event Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={event?.title}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Monthly Meetup"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={event?.description || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your event..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="event_type"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Event Type *
          </label>
          <select
            id="event_type"
            name="event_type"
            required
            defaultValue={event?.event_type || 'meetup'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="meetup">Meetup</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
            <option value="conference">Conference</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="max_attendees"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Max Attendees
          </label>
          <input
            id="max_attendees"
            name="max_attendees"
            type="number"
            min="0"
            defaultValue={event?.max_attendees || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="starts_at"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Start Date & Time *
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={event ? formatDateForInput(event.starts_at) : ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="ends_at"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            End Date & Time
          </label>
          <input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            defaultValue={event?.ends_at ? formatDateForInput(event.ends_at) : ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="is_virtual"
          type="checkbox"
          checked={isVirtual}
          onChange={(e) => setIsVirtual(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_virtual" className="ml-2 text-sm font-medium text-gray-700">
          This is a virtual event
        </label>
      </div>

      {isVirtual && (
        <div>
          <label
            htmlFor="virtual_link"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Virtual Meeting Link
          </label>
          <input
            id="virtual_link"
            name="virtual_link"
            type="url"
            defaultValue={event?.virtual_link || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://zoom.us/j/..."
          />
        </div>
      )}

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={event?.location || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="123 Main St, City, State"
        />
      </div>

      <div>
        <label
          htmlFor="location_details"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Location Details
        </label>
        <textarea
          id="location_details"
          name="location_details"
          rows={2}
          defaultValue={event?.location_details || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Building name, floor, room number, parking instructions, etc."
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
