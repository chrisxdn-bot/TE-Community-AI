import { NextRequest, NextResponse } from 'next/server'
import { processSlackMessage } from '@/lib/integrations/slack'

/**
 * Slack Events API Webhook
 * Handles incoming events from Slack (messages, reactions, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle URL verification challenge
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge })
    }

    // Handle event callbacks
    if (body.type === 'event_callback') {
      const { event } = body

      // Process different event types
      switch (event.type) {
        case 'message':
          // Ignore bot messages and message changes
          if (!event.bot_id && !event.subtype) {
            await processSlackMessage(body)
          }
          break

        case 'reaction_added':
          // Handle reactions (future enhancement)
          console.log('Reaction added:', event)
          break

        default:
          console.log('Unhandled event type:', event.type)
      }

      // Acknowledge receipt immediately
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })
  } catch (error) {
    console.error('Slack webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle GET requests (for testing)
 */
export async function GET() {
  return NextResponse.json({
    status: 'Slack webhook endpoint',
    message: 'Use POST to send events',
  })
}
