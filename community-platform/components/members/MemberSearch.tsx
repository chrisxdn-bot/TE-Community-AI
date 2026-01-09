'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function MemberSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [orderBy, setOrderBy] = useState(searchParams.get('orderBy') || 'name')

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setOrderBy(searchParams.get('orderBy') || 'name')
  }, [searchParams])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ search, orderBy })
  }

  function handleOrderChange(newOrderBy: string) {
    setOrderBy(newOrderBy)
    updateParams({ search, orderBy: newOrderBy })
  }

  function updateParams(params: { search: string; orderBy: string }) {
    const newParams = new URLSearchParams()
    if (params.search) {
      newParams.set('search', params.search)
    }
    if (params.orderBy && params.orderBy !== 'name') {
      newParams.set('orderBy', params.orderBy)
    }
    router.push(`/members?${newParams.toString()}`)
  }

  function clearSearch() {
    setSearch('')
    setOrderBy('name')
    router.push('/members')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Members
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="orderBy"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sort By
            </label>
            <select
              id="orderBy"
              value={orderBy}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Name (A-Z)</option>
              <option value="engagement">Engagement Score</option>
              <option value="support">Support Score</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Search
          </button>
          {(search || orderBy !== 'name') && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
