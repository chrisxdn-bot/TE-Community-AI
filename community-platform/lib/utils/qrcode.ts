import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return qrCodeDataURL
  } catch (error) {
    throw new Error('Failed to generate QR code')
  }
}

export function getCheckInURL(qrCodeData: string): string {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseURL}/checkin/${qrCodeData}`
}
