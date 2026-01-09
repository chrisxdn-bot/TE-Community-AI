import { QRScanner } from '@/components/checkin/QRScanner'

export default function ScannerPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Scanner</h1>
        <p className="text-gray-600">
          Scan event QR codes to quickly check in attendees
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <QRScanner />
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="font-semibold text-blue-900 mb-2">How it works:</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
          <li>Click "Start QR Scanner" to activate your camera</li>
          <li>Point your camera at an event QR code</li>
          <li>The system will automatically detect and navigate to the check-in page</li>
          <li>Select your name to complete the check-in</li>
        </ol>
      </div>
    </div>
  )
}
