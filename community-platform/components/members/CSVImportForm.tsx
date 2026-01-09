'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { importMembersFromCSV, ImportResult } from '@/lib/members/import'

export function CSVImportForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string>('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      setError('Please select a CSV file')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const text = await file.text()
      const importResult = await importMembersFromCSV(text)
      setResult(importResult)

      if (importResult.success > 0) {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import CSV')
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a valid CSV file')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError('')
      setResult(null)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="csv-file"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select CSV File
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <p className="font-semibold">Import Complete</p>
              <p className="text-sm mt-1">
                Successfully imported {result.success} member(s)
              </p>
              {result.failed > 0 && (
                <p className="text-sm mt-1">Failed to import {result.failed} member(s)</p>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="font-semibold text-red-900 mb-2">Errors:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="text-sm text-red-700">
                      <strong>Row {err.row}:</strong> {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!file || loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Importing...' : 'Import Members'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/members')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Back to Members
          </button>
        </div>
      </form>
    </div>
  )
}
