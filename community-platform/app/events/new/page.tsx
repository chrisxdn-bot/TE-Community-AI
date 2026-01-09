import { EventForm } from '@/components/events/EventForm'

export default function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="mt-2 text-gray-600">
          Create a new event with QR code check-in
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <EventForm />
      </div>
    </div>
  )
}
