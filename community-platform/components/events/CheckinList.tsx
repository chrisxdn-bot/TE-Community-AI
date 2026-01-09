'use client'

interface CheckinListProps {
  checkins: Array<{
    id: string
    checked_in_at: string
    check_in_method: string
    member: {
      id: string
      first_name: string
      last_name: string
      email: string | null
      current_city: string | null
    }
  }>
}

export function CheckinList({ checkins }: CheckinListProps) {
  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (checkins.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No check-ins yet for this event
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {checkins.map((checkin) => (
        <div
          key={checkin.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {checkin.member.first_name[0]}
                {checkin.member.last_name[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {checkin.member.first_name} {checkin.member.last_name}
              </p>
              <p className="text-sm text-gray-600">
                {checkin.member.email || checkin.member.current_city || 'No details'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {formatTime(checkin.checked_in_at)}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {checkin.check_in_method}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
