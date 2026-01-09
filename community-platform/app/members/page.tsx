import Link from 'next/link'
import { getMembers } from '@/lib/members/actions'
import { MemberList } from '@/components/members/MemberList'
import { MemberSearch } from '@/components/members/MemberSearch'

interface PageProps {
  searchParams: Promise<{
    search?: string
    city?: string
    orderBy?: string
    page?: string
  }>
}

export default async function MembersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { data: members, count, error } = await getMembers({
    search: params.search,
    city: params.city,
    orderBy: params.orderBy,
    page: params.page ? parseInt(params.page) : 1,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="mt-2 text-gray-600">
              {count || 0} total members in the community
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/members/import"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Import CSV
            </Link>
            <Link
              href="/members/new"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Add Member
            </Link>
          </div>
        </div>
      </div>

      <MemberSearch />

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading members: {error}
        </div>
      ) : (
        <MemberList members={members || []} totalCount={count || 0} />
      )}
    </div>
  )
}
