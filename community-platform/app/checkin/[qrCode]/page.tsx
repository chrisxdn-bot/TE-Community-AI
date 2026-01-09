import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckinForm } from '@/components/checkin/CheckinForm'

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ qrCode: string }>
}) {
  const { qrCode } = await params
  const supabase = await createClient()

  // Find event by QR code
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('qr_code_data', qrCode)
    .single()

  if (error || !event) {
    notFound()
  }

  // Check if event is active
  if (!event.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Inactive</h1>
          <p className="text-gray-600">
            This event is no longer accepting check-ins.
          </p>
        </div>
      </div>
    )
  }

  // Get check-in count
  const { count: checkinCount } = await supabase
    .from('event_checkins')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)

  // Check if at capacity
  const isAtCapacity =
    event.max_attendees && checkinCount ? checkinCount >= event.max_attendees : false

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Event Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <p className="text-gray-600">{formatDate(event.starts_at)}</p>
          </div>

          {event.description && (
            <p className="text-gray-700 mb-6 text-center">{event.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {event.location && (
              <div className="flex items-center text-gray-600">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
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
                </svg>
                <span className="text-sm">{event.location}</span>
              </div>
            )}

            {event.max_attendees && (
              <div className="flex items-center text-gray-600">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
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
                <span className="text-sm">
                  {checkinCount || 0} / {event.max_attendees} attendees
                </span>
              </div>
            )}
          </div>

          {isAtCapacity && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
              <p className="font-medium">Event is at capacity</p>
              <p className="text-sm">
                This event has reached its maximum number of attendees.
              </p>
            </div>
          )}
        </div>

        {/* Check-in Form Card */}
        {!isAtCapacity && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Check In
            </h2>
            <CheckinForm eventId={event.id} />
          </div>
        )}
      </div>
    </div>
  )
}
