/**
 * Slack Integration Module
 * Handles Slack API interactions, message processing, and sentiment analysis
 */

import { createClient } from '@/lib/supabase/server'

export interface SlackMessage {
  type: string
  user: string
  text: string
  ts: string
  channel: string
  thread_ts?: string
}

export interface SlackEvent {
  type: string
  event: SlackMessage
  team_id: string
  api_app_id: string
}

/**
 * Process incoming Slack message and store in database
 */
export async function processSlackMessage(event: SlackEvent) {
  const supabase = await createClient()
  const { event: message } = event

  try {
    // Check if channel is connected
    const { data: channel } = await supabase
      .from('connected_channels')
      .select('*')
      .eq('platform', 'slack')
      .eq('channel_id', message.channel)
      .eq('is_monitored', true)
      .single()

    if (!channel) {
      console.log('Channel not monitored:', message.channel)
      return { success: false, reason: 'Channel not monitored' }
    }

    // Find member by platform identity
    const { data: identity } = await supabase
      .from('platform_identities')
      .select('member_id')
      .eq('platform', 'slack')
      .eq('platform_user_id', message.user)
      .single()

    // Store message
    const { data: storedMessage, error } = await supabase
      .from('messages')
      .insert({
        channel_id: channel.id,
        platform_message_id: message.ts,
        member_id: identity?.member_id || null,
        platform_user_id: message.user,
        content: message.text,
        content_preview: message.text.substring(0, 500),
        message_type: message.thread_ts ? 'thread_reply' : 'text',
        thread_id: message.thread_ts || null,
        sent_at: new Date(parseFloat(message.ts) * 1000).toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing message:', error)
      return { success: false, error: error.message }
    }

    // Create engagement activity if member is identified
    if (identity?.member_id) {
      await supabase
        .from('engagement_activities')
        .insert({
          member_id: identity.member_id,
          platform: 'slack',
          activity_type: 'message_sent',
          activity_data: {
            channel_id: channel.id,
            message_id: storedMessage.id,
            length: message.text.length,
          },
          points_earned: 1,
          occurred_at: new Date(parseFloat(message.ts) * 1000).toISOString(),
        })
    }

    return { success: true, message: storedMessage }
  } catch (error) {
    console.error('Error processing Slack message:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Sync Slack channel history
 */
export async function syncSlackChannel(channelId: string, slackToken: string) {
  const supabase = await createClient()

  try {
    // Fetch channel info
    const channelInfoResponse = await fetch(
      `https://slack.com/api/conversations.info?channel=${channelId}`,
      {
        headers: {
          'Authorization': `Bearer ${slackToken}`,
        },
      }
    )

    const channelInfo = await channelInfoResponse.json()

    if (!channelInfo.ok) {
      throw new Error(`Slack API error: ${channelInfo.error}`)
    }

    // Store or update channel
    const { data: channel } = await supabase
      .from('connected_channels')
      .upsert({
        platform: 'slack',
        channel_id: channelId,
        channel_name: channelInfo.channel.name,
        channel_type: channelInfo.channel.is_private ? 'private' : 'public',
        description: channelInfo.channel.purpose?.value || null,
        member_count: channelInfo.channel.num_members,
        is_active: !channelInfo.channel.is_archived,
        last_synced_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Fetch message history
    const historyResponse = await fetch(
      `https://slack.com/api/conversations.history?channel=${channelId}&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${slackToken}`,
        },
      }
    )

    const history = await historyResponse.json()

    if (!history.ok) {
      throw new Error(`Slack API error: ${history.error}`)
    }

    // Process each message
    for (const message of history.messages) {
      if (message.type === 'message' && message.user) {
        await processSlackMessage({
          type: 'message',
          event: message,
          team_id: '',
          api_app_id: '',
        })
      }
    }

    return { success: true, messageCount: history.messages.length }
  } catch (error) {
    console.error('Error syncing Slack channel:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Link Slack user to member
 */
export async function linkSlackUser(slackUserId: string, memberId: string, slackToken: string) {
  const supabase = await createClient()

  try {
    // Fetch Slack user info
    const userInfoResponse = await fetch(
      `https://slack.com/api/users.info?user=${slackUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${slackToken}`,
        },
      }
    )

    const userInfo = await userInfoResponse.json()

    if (!userInfo.ok) {
      throw new Error(`Slack API error: ${userInfo.error}`)
    }

    const user = userInfo.user

    // Create platform identity
    const { data, error } = await supabase
      .from('platform_identities')
      .upsert({
        member_id: memberId,
        platform: 'slack',
        platform_user_id: slackUserId,
        platform_username: user.name,
        platform_display_name: user.real_name || user.name,
        platform_avatar_url: user.profile?.image_192 || null,
        is_verified: true,
        verified_at: new Date().toISOString(),
        raw_data: user,
      })
      .select()
      .single()

    if (error) {
      console.error('Error linking Slack user:', error)
      return { success: false, error: error.message }
    }

    return { success: true, identity: data }
  } catch (error) {
    console.error('Error linking Slack user:', error)
    return { success: false, error: String(error) }
  }
}
