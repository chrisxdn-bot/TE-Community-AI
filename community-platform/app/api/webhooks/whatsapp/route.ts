import { NextRequest, NextResponse } from 'next/server'
import { processWhatsAppMessage } from '@/lib/integrations/whatsapp'

/**
 * Twilio WhatsApp Webhook
 * Handles incoming WhatsApp messages via Twilio
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData()

    const message = {
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string,
      MessageSid: formData.get('MessageSid') as string,
      ProfileName: formData.get('ProfileName') as string || undefined,
    }

    // Validate required fields
    if (!message.From || !message.To || !message.Body || !message.MessageSid) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Process the message
    const result = await processWhatsAppMessage(message)

    if (!result.success) {
      console.error('Failed to process WhatsApp message:', result.error)
      // Still return 200 to acknowledge receipt to Twilio
      return new NextResponse('', { status: 200 })
    }

    // Return TwiML response (empty is fine, just acknowledge)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    // Always return 200 to Twilio to avoid retries
    return new NextResponse('', { status: 200 })
  }
}

/**
 * Handle GET requests (for testing/verification)
 */
export async function GET() {
  return NextResponse.json({
    status: 'WhatsApp webhook endpoint',
    message: 'Use POST to send messages',
  })
}
