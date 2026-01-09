'use client'

import { useEffect, useState } from 'react'
import { Event } from '@/lib/types/event'
import { generateQRCode, getCheckInURL } from '@/lib/utils/qrcode'

interface EventQRCodeProps {
  event: Event
}

export function EventQRCode({ event }: EventQRCodeProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (event.qr_code_data) {
      const checkInURL = getCheckInURL(event.qr_code_data)
      generateQRCode(checkInURL)
        .then(setQrCodeDataURL)
        .catch((error) => console.error('Failed to generate QR code:', error))
        .finally(() => setLoading(false))
    }
  }, [event.qr_code_data])

  async function downloadQRCode() {
    if (!qrCodeDataURL) return

    const link = document.createElement('a')
    link.href = qrCodeDataURL
    link.download = `${event.title.replace(/\s+/g, '-')}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Check-in QR Code</h3>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : qrCodeDataURL ? (
        <div className="space-y-4">
          <div className="flex justify-center bg-white p-4 rounded border-2 border-gray-200">
            <img
              src={qrCodeDataURL}
              alt="Event Check-in QR Code"
              className="w-full max-w-xs"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Scan this QR code to check in to the event
            </p>
            <button
              onClick={downloadQRCode}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Download QR Code
            </button>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-2">Or share this link:</p>
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <code className="text-xs break-all">
                {getCheckInURL(event.qr_code_data!)}
              </code>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8">
          No QR code available for this event
        </p>
      )}
    </div>
  )
}
