import { createClient } from '@/lib/supabase/server'
import { MemberForm } from '@/components/members/MemberForm'
import { notFound } from 'next/navigation'

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !member) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Member</h1>
        <p className="mt-2 text-gray-600">
          Update information for {member.first_name} {member.last_name}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <MemberForm member={member} />
      </div>
    </div>
  )
}
