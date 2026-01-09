import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getEvent, getEventCheckins } from '@/lib/events/actions'
import { EventQRCode } from '@/components/events/EventQRCode'
import { CheckinList } from '@/components/events/CheckinList'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { event, error } = await getEvent(id)

  if (error || !event) {
    notFound()
  }

  const { data: checkins } = await getEventCheckins(id)

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function isUpcoming(dateString: string) {
    return new Date(dateString) > new Date()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/events"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          ← Back to Events
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h1>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      isUpcoming(event.starts_at)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isUpcoming(event.starts_at) ? 'Upcoming' : 'Past'}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded capitalize">
                    {event.event_type}
                  </span>
                </div>
              </div>
              <Link
                href={`/events/${event.id}/edit`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Edit
              </Link>
            </div>

            {event.description && (
              <p className="text-gray-700 mb-6">{event.description}</p>
            )}

            <div className="space-y-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-gray-400 mr-3 mt-0.5"
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
                <div>
                  <p className="font-medium text-gray-900">Date & Time</p>
                  <p className="text-gray-600">{formatDate(event.starts_at)}</p>
                  {event.ends_at && (
                    <p className="text-gray-600 text-sm">
                      Until {formatDate(event.ends_at)}
                    </p>
                  )}
                </div>
              </div>

              {event.location && (
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-3 mt-0.5"
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
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">{event.location}</p>
                    {event.location_details && (
                      <p className="text-gray-600 text-sm mt-1">
                        {event.location_details}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {event.is_virtual && event.virtual_link && (
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-3 mt-0.5"
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
                  <div>
                    <p className="font-medium text-gray-900">Virtual Meeting</p>
                    <a
                      href={event.virtual_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm break-all"
                    >
                      {event.virtual_link}
                    </a>
                  </div>
                </div>
              )}

              {event.max_attendees && (
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-3 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Capacity</p>
                    <p className="text-gray-600">
                      {checkins?.length || 0} / {event.max_attendees} attendees
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attendees */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Attendees ({checkins?.length || 0})
            </h2>
            <CheckinList checkins={checkins || []} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <EventQRCode event={event} />

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/checkin/${event.qr_code_data}`}
                target="_blank"
                className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Open Check-in Page
              </Link>
              <Link
                href={`/events/${event.id}/checkins`}
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                View All Check-ins
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
