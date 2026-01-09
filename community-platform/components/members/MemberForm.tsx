'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMember, updateMember } from '@/lib/members/actions'
import { Member } from '@/lib/types/member'

interface MemberFormProps {
  member?: Member
}

export function MemberForm({ member }: MemberFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      current_city: formData.get('current_city') as string,
      phone: formData.get('phone') as string,
      linkedin_url: formData.get('linkedin_url') as string,
      years_with_te: formData.get('years_with_te')
        ? parseInt(formData.get('years_with_te') as string)
        : undefined,
      bio: formData.get('bio') as string,
    }

    const result = member
      ? await updateMember(member.id, data)
      : await createMember(data)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/members')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name *
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            defaultValue={member?.first_name}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name *
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            defaultValue={member?.last_name}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={member?.email || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={member?.phone || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="current_city"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Current City
          </label>
          <input
            id="current_city"
            name="current_city"
            type="text"
            defaultValue={member?.current_city || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="linkedin_url"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          LinkedIn URL
        </label>
        <input
          id="linkedin_url"
          name="linkedin_url"
          type="url"
          defaultValue={member?.linkedin_url || ''}
          placeholder="https://linkedin.com/in/..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label
          htmlFor="years_with_te"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Years with Community
        </label>
        <input
          id="years_with_te"
          name="years_with_te"
          type="number"
          min="0"
          defaultValue={member?.years_with_te || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={member?.bio || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : member ? 'Update Member' : 'Create Member'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
