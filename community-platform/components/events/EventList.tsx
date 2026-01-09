'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Event } from '@/lib/types/event'
import { deleteEvent, toggleEventStatus } from '@/lib/events/actions'

interface EventListProps {
  events: Event[]
}

export function EventList({ events }: EventListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    setDeletingId(id)
    const result = await deleteEvent(id)

    if (result.error) {
      alert(`Error: ${result.error}`)
    }

    setDeletingId(null)
    router.refresh()
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    const result = await toggleEventStatus(id, !currentStatus)

    if (result.error) {
      alert(`Error: ${result.error}`)
    }

    router.refresh()
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function isUpcoming(dateString: string) {
    return new Date(dateString) > new Date()
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
        <p className="mt-2 text-gray-600">
          Get started by creating your first event.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {event.title}
                </h3>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    isUpcoming(event.starts_at)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {isUpcoming(event.starts_at) ? 'Upcoming' : 'Past'}
                </span>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {event.event_type}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(event.starts_at)}
              </div>
              {event.location && (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {event.location}
                </div>
              )}
              {event.is_virtual && (
                <div className="flex items-center text-purple-600">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  Virtual Event
                </div>
              )}
            </div>

            {event.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {event.description}
              </p>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Link
                href={`/events/${event.id}`}
                className="flex-1 text-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                View
              </Link>
              <Link
                href={`/events/${event.id}/edit`}
                className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(event.id, event.title)}
                disabled={deletingId === event.id}
                className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition disabled:opacity-50"
              >
                {deletingId === event.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
