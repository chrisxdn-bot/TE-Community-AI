import Link from 'next/link'
import { getEvents } from '@/lib/events/actions'
import { EventList } from '@/components/events/EventList'

interface PageProps {
  searchParams: Promise<{
    upcoming?: string
    page?: string
  }>
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { data: events, count, error } = await getEvents({
    upcoming: params.upcoming === 'true',
    page: params.page ? parseInt(params.page) : 1,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="mt-2 text-gray-600">
              {count || 0} total events
            </p>
          </div>
          <Link
            href="/events/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Create Event
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading events: {error}
        </div>
      ) : (
        <EventList events={events || []} />
      )}
    </div>
  )
}
