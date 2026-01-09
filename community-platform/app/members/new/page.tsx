import { MemberForm } from '@/components/members/MemberForm'

export default function NewMemberPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Member</h1>
        <p className="mt-2 text-gray-600">
          Add a new member to the community platform
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <MemberForm />
      </div>
    </div>
  )
}
