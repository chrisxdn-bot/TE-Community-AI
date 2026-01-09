'use server'

import { createClient } from '@/lib/supabase/server'
import { MemberFormData } from '@/lib/types/member'

export interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; error: string; data: any }>
}

export async function importMembersFromCSV(
  csvData: string
): Promise<ImportResult> {
  const supabase = await createClient()
  const lines = csvData.trim().split('\n')

  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one data row')
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
  }

  // Process each row
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i])

      if (values.length === 0 || values.every((v) => !v)) {
        continue // Skip empty lines
      }

      const member: any = {}
      headers.forEach((header, index) => {
        const value = values[index]?.trim()
        if (value) {
          member[header] = value
        }
      })

      // Validate required fields
      if (!member.first_name || !member.last_name) {
        result.errors.push({
          row: i + 1,
          error: 'Missing required fields: first_name and last_name',
          data: member,
        })
        result.failed++
        continue
      }

      // Prepare data for insert
      const memberData: MemberFormData = {
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email || undefined,
        current_city: member.current_city || member.city || undefined,
        phone: member.phone || undefined,
        linkedin_url: member.linkedin_url || member.linkedin || undefined,
        years_with_te: member.years_with_te
          ? parseInt(member.years_with_te)
          : undefined,
        bio: member.bio || undefined,
      }

      // Insert into database
      const { error } = await supabase.from('members').insert([memberData])

      if (error) {
        result.errors.push({
          row: i + 1,
          error: error.message,
          data: memberData,
        })
        result.failed++
      } else {
        result.success++
      }
    } catch (error) {
      result.errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: lines[i],
      })
      result.failed++
    }
  }

  return result
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}
