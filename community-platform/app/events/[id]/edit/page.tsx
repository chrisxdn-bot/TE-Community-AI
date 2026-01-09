import { notFound } from 'next/navigation'
import { getEvent } from '@/lib/events/actions'
import { EventForm } from '@/components/events/EventForm'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { event, error } = await getEvent(id)

  if (error || !event) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="mt-2 text-gray-600">Update event information for {event.title}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <EventForm event={event} />
      </div>
    </div>
  )
}
