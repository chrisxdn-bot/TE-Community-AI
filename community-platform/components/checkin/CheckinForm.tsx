'use client'

import { useState } from 'react'
import { checkInToEvent } from '@/lib/events/actions'

interface CheckinFormProps {
  eventId: string
}

export function CheckinForm({ eventId }: CheckinFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState<any>(null)

  async function handleSearch() {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/members/search?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSearchResults(data.members || [])
      }
    } catch (err) {
      setError('Failed to search members')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckin() {
    if (!selectedMember) return

    setLoading(true)
    setError('')

    const result = await checkInToEvent(eventId, selectedMember.id, 'qr')

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Check-in Successful!
        </h3>
        <p className="text-gray-600">
          {selectedMember?.first_name} {selectedMember?.last_name} has been checked in.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!selectedMember ? (
        <>
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search for yourself
            </label>
            <div className="flex gap-2">
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your name or email..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Select your name:</p>
              {searchResults.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
                >
                  <p className="font-medium text-gray-900">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {member.email || member.current_city || 'No details'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !loading && (
            <div className="text-center py-4 text-gray-600">
              No members found. Try a different search term.
            </div>
          )}
        </>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">You selected:</p>
            <p className="font-medium text-gray-900">
              {selectedMember.first_name} {selectedMember.last_name}
            </p>
            <p className="text-sm text-gray-600">
              {selectedMember.email || selectedMember.current_city}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCheckin}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Checking in...' : 'Confirm Check-in'}
            </button>
            <button
              onClick={() => {
                setSelectedMember(null)
                setSearchResults([])
                setSearchQuery('')
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Change
            </button>
          </div>
        </>
      )}
    </div>
  )
}
