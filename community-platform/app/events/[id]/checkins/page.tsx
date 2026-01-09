import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvent, getEventCheckins } from '@/lib/events/actions'

export default async function EventCheckinsPage({
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

  function formatDateTime(dateString: string) {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  async function exportToCSV() {
    if (!checkins || checkins.length === 0) return

    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'City',
      'Check-in Time',
      'Check-in Method',
    ]

    const rows = checkins.map((checkin) => [
      checkin.member.first_name,
      checkin.member.last_name,
      checkin.member.email || '',
      checkin.member.current_city || '',
      new Date(checkin.checked_in_at).toLocaleString(),
      checkin.check_in_method,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${event.title}-checkins.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href={`/events/${event.id}`}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          ← Back to Event
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Check-ins</h1>
            <p className="mt-2 text-gray-600">{event.title}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Check-ins</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {checkins?.length || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">QR Code Check-ins</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {checkins?.filter((c) => c.check_in_method === 'qr').length || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Manual Check-ins</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {checkins?.filter((c) => c.check_in_method === 'manual').length || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Link Check-ins</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {checkins?.filter((c) => c.check_in_method === 'link').length || 0}
          </p>
        </div>
      </div>

      {/* Check-ins Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">All Check-ins</h2>
          {checkins && checkins.length > 0 && (
            <button
              onClick={() => {
                const csvContent =
                  'First Name,Last Name,Email,City,Check-in Time,Check-in Method\n' +
                  checkins
                    .map(
                      (c) =>
                        `"${c.member.first_name}","${c.member.last_name}","${
                          c.member.email || ''
                        }","${c.member.current_city || ''}","${new Date(
                          c.checked_in_at
                        ).toLocaleString()}","${c.check_in_method}"`
                    )
                    .join('\n')

                const blob = new Blob([csvContent], {
                  type: 'text/csv;charset=utf-8;',
                })
                const link = document.createElement('a')
                const url = URL.createObjectURL(blob)
                link.setAttribute('href', url)
                link.setAttribute(
                  'download',
                  `${event.title.replace(/\s+/g, '-')}-checkins.csv`
                )
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
            >
              Export CSV
            </button>
          )}
        </div>

        {checkins && checkins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {checkins.map((checkin) => {
                  const { date, time } = formatDateTime(checkin.checked_in_at)
                  return (
                    <tr key={checkin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {checkin.member.first_name[0]}
                                {checkin.member.last_name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {checkin.member.first_name} {checkin.member.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {checkin.member.email || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {checkin.member.current_city || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{date}</div>
                        <div className="text-sm text-gray-500">{time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            checkin.check_in_method === 'qr'
                              ? 'bg-blue-100 text-blue-800'
                              : checkin.check_in_method === 'manual'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {checkin.check_in_method}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No check-ins yet for this event
          </div>
        )}
      </div>
    </div>
  )
}
