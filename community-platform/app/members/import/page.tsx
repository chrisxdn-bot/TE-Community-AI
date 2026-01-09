import { CSVImportForm } from '@/components/members/CSVImportForm'

export default function ImportMembersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import Members</h1>
        <p className="mt-2 text-gray-600">
          Upload a CSV file to bulk import members into the platform
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          CSV File Format
        </h2>
        <p className="text-gray-600 mb-4">
          Your CSV file should have the following columns (first_name and last_name
          are required):
        </p>
        <div className="bg-gray-50 rounded p-4 mb-4">
          <code className="text-sm text-gray-800">
            first_name,last_name,email,phone,current_city,linkedin_url,years_with_te,bio
          </code>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Required fields:</strong> first_name, last_name
          </p>
          <p>
            <strong>Optional fields:</strong> email, phone, current_city, linkedin_url,
            years_with_te, bio
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Example CSV</h2>
        <div className="bg-gray-50 rounded p-4">
          <pre className="text-sm text-gray-800 overflow-x-auto">
            {`first_name,last_name,email,current_city,years_with_te
John,Doe,john@example.com,New York,2
Jane,Smith,jane@example.com,San Francisco,3
Bob,Johnson,bob@example.com,Chicago,1`}
          </pre>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <CSVImportForm />
      </div>
    </div>
  )
}
