'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useRouter } from 'next/navigation'

export function QRScanner() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  async function startScanning() {
    setError('')
    setScanning(true)

    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Stop scanning
          scanner.stop().then(() => {
            setScanning(false)

            // Extract QR code from URL if it's a full URL
            let qrCode = decodedText
            if (decodedText.includes('/checkin/')) {
              qrCode = decodedText.split('/checkin/')[1]
            }

            // Navigate to check-in page
            router.push(`/checkin/${qrCode}`)
          })
        },
        (errorMessage) => {
          // Silent - just scanning errors
        }
      )

      setHasPermission(true)
    } catch (err: any) {
      setError(
        err.message || 'Failed to start camera. Please check permissions.'
      )
      setScanning(false)
      setHasPermission(false)
    }
  }

  async function stopScanning() {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
      setScanning(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {hasPermission === false && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium mb-1">Camera permission required</p>
          <p className="text-sm">
            Please enable camera access in your browser settings to scan QR codes.
          </p>
        </div>
      )}

      <div
        id="qr-reader"
        className={`${
          scanning ? 'block' : 'hidden'
        } w-full rounded-lg overflow-hidden border-2 border-blue-500`}
      />

      {!scanning ? (
        <button
          onClick={startScanning}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          Start QR Scanner
        </button>
      ) : (
        <button
          onClick={stopScanning}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition font-medium"
        >
          Stop Scanning
        </button>
      )}

      <div className="text-center text-sm text-gray-600">
        <p>Point your camera at a QR code to check in</p>
      </div>
    </div>
  )
}
