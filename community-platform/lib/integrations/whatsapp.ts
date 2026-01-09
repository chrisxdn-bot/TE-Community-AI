/**
 * WhatsApp Integration Module via Twilio
 * Handles WhatsApp message processing and member engagement tracking
 */

import { createClient } from '@/lib/supabase/server'

export interface WhatsAppMessage {
  From: string  // Phone number in format: whatsapp:+1234567890
  To: string
  Body: string
  MessageSid: string
  Timestamp?: string
  ProfileName?: string
}

/**
 * Process incoming WhatsApp message from Twilio webhook
 */
export async function processWhatsAppMessage(message: WhatsAppMessage) {
  const supabase = await createClient()

  try {
    // Extract phone number from WhatsApp format
    const phoneNumber = message.From.replace('whatsapp:', '')

    // Find member by platform identity or phone number
    let memberId: string | null = null

    // Try to find by platform identity first
    const { data: identity } = await supabase
      .from('platform_identities')
      .select('member_id')
      .eq('platform', 'whatsapp')
      .eq('platform_user_id', phoneNumber)
      .single()

    if (identity) {
      memberId = identity.member_id
    } else {
      // Try to find by phone number in members table
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('phone', phoneNumber)
        .single()

      if (member) {
        memberId = member.id

        // Create platform identity
        await supabase
          .from('platform_identities')
          .insert({
            member_id: member.id,
            platform: 'whatsapp',
            platform_user_id: phoneNumber,
            platform_display_name: message.ProfileName || null,
            confidence_score: 0.9,
          })
      }
    }

    // Get or create WhatsApp channel
    const { data: channel } = await supabase
      .from('connected_channels')
      .upsert({
        platform: 'whatsapp',
        channel_id: message.To.replace('whatsapp:', ''),
        channel_name: 'WhatsApp Group',
        channel_type: 'group',
        is_active: true,
        is_monitored: true,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (!channel) {
      throw new Error('Failed to get or create WhatsApp channel')
    }

    // Store message
    const { data: storedMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        channel_id: channel.id,
        platform_message_id: message.MessageSid,
        member_id: memberId,
        platform_user_id: phoneNumber,
        content: message.Body,
        content_preview: message.Body.substring(0, 500),
        message_type: 'text',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (messageError) {
      console.error('Error storing WhatsApp message:', messageError)
      return { success: false, error: messageError.message }
    }

    // Create engagement activity if member is identified
    if (memberId) {
      await supabase
        .from('engagement_activities')
        .insert({
          member_id: memberId,
          platform: 'whatsapp',
          activity_type: 'message_sent',
          activity_data: {
            channel_id: channel.id,
            message_id: storedMessage.id,
            length: message.Body.length,
          },
          points_earned: 1,
          occurred_at: new Date().toISOString(),
        })
    }

    return { success: true, message: storedMessage, memberId }
  } catch (error) {
    console.error('Error processing WhatsApp message:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials not configured')
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${fromNumber}`,
          To: `whatsapp:${to}`,
          Body: message,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Twilio API error: ${data.message}`)
    }

    return { success: true, sid: data.sid }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Link WhatsApp number to member
 */
export async function linkWhatsAppUser(phoneNumber: string, memberId: string, displayName?: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('platform_identities')
      .upsert({
        member_id: memberId,
        platform: 'whatsapp',
        platform_user_id: phoneNumber,
        platform_display_name: displayName || null,
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error linking WhatsApp user:', error)
      return { success: false, error: error.message }
    }

    return { success: true, identity: data }
  } catch (error) {
    console.error('Error linking WhatsApp user:', error)
    return { success: false, error: String(error) }
  }
}
