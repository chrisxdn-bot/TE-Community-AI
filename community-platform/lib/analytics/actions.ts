'use server'

import { createClient } from '@/lib/supabase/server'

export interface DashboardStats {
  totalMembers: number
  activeMembers: number  // Active in last 30 days
  totalEvents: number
  upcomingEvents: number
  totalMessages: number
  totalCheckins: number
  averageEngagement: number
  averageSentiment: number
}

export interface TopContributor {
  id: string
  name: string
  engagement_score: number
  support_score: number
  message_count: number
  avatar_url: string | null
}

export interface ActivityTrend {
  date: string
  message_count: number
  checkin_count: number
  member_count: number
}

/**
 * Get overall dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  try {
    // Get member counts
    const { count: totalMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get active members (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: activeMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('last_active_at', thirtyDaysAgo.toISOString())

    // Get event counts
    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    const { count: upcomingEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('starts_at', new Date().toISOString())

    // Get message count (last 30 days)
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', thirtyDaysAgo.toISOString())

    // Get checkin count (last 30 days)
    const { count: totalCheckins } = await supabase
      .from('event_checkins')
      .select('*', { count: 'exact', head: true })
      .gte('checked_in_at', thirtyDaysAgo.toISOString())

    // Calculate average engagement score
    const { data: engagementData } = await supabase
      .from('members')
      .select('engagement_score')
      .eq('is_active', true)

    const averageEngagement = engagementData && engagementData.length > 0
      ? engagementData.reduce((sum, m) => sum + (m.engagement_score || 0), 0) / engagementData.length
      : 0

    // Calculate average sentiment (last 30 days)
    const { data: sentimentData } = await supabase
      .from('messages')
      .select('sentiment_score')
      .gte('sent_at', thirtyDaysAgo.toISOString())
      .not('sentiment_score', 'is', null)

    const averageSentiment = sentimentData && sentimentData.length > 0
      ? sentimentData.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / sentimentData.length
      : 0

    return {
      totalMembers: totalMembers || 0,
      activeMembers: activeMembers || 0,
      totalEvents: totalEvents || 0,
      upcomingEvents: upcomingEvents || 0,
      totalMessages: totalMessages || 0,
      totalCheckins: totalCheckins || 0,
      averageEngagement: parseFloat(averageEngagement.toFixed(2)),
      averageSentiment: parseFloat(averageSentiment.toFixed(2)),
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalMembers: 0,
      activeMembers: 0,
      totalEvents: 0,
      upcomingEvents: 0,
      totalMessages: 0,
      totalCheckins: 0,
      averageEngagement: 0,
      averageSentiment: 0,
    }
  }
}

/**
 * Get top contributors by engagement score
 */
export async function getTopContributors(limit: number = 10): Promise<TopContributor[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('members')
      .select('id, first_name, last_name, engagement_score, support_score, avatar_url')
      .eq('is_active', true)
      .order('engagement_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top contributors:', error)
      return []
    }

    // Get message counts for each contributor
    const contributors = await Promise.all(
      data.map(async (member) => {
        const { count } = await supabase
          .from('engagement_activities')
          .select('*', { count: 'exact', head: true })
          .eq('member_id', member.id)
          .eq('activity_type', 'message_sent')

        return {
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          engagement_score: member.engagement_score || 0,
          support_score: member.support_score || 0,
          message_count: count || 0,
          avatar_url: member.avatar_url,
        }
      })
    )

    return contributors
  } catch (error) {
    console.error('Error fetching top contributors:', error)
    return []
  }
}

/**
 * Get activity trends over the last 30 days
 */
export async function getActivityTrends(): Promise<ActivityTrend[]> {
  const supabase = await createClient()

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get daily message counts
    const { data: messages } = await supabase
      .from('messages')
      .select('sent_at')
      .gte('sent_at', thirtyDaysAgo.toISOString())

    // Get daily checkin counts
    const { data: checkins } = await supabase
      .from('event_checkins')
      .select('checked_in_at')
      .gte('checked_in_at', thirtyDaysAgo.toISOString())

    // Get daily new member counts
    const { data: newMembers } = await supabase
      .from('members')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Create a map of dates with counts
    const dateMap = new Map<string, ActivityTrend>()

    // Initialize all dates in the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dateMap.set(dateStr, {
        date: dateStr,
        message_count: 0,
        checkin_count: 0,
        member_count: 0,
      })
    }

    // Count messages per day
    messages?.forEach((msg) => {
      const dateStr = msg.sent_at.split('T')[0]
      const trend = dateMap.get(dateStr)
      if (trend) {
        trend.message_count++
      }
    })

    // Count checkins per day
    checkins?.forEach((checkin) => {
      const dateStr = checkin.checked_in_at.split('T')[0]
      const trend = dateMap.get(dateStr)
      if (trend) {
        trend.checkin_count++
      }
    })

    // Count new members per day
    newMembers?.forEach((member) => {
      const dateStr = member.created_at.split('T')[0]
      const trend = dateMap.get(dateStr)
      if (trend) {
        trend.member_count++
      }
    })

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error('Error fetching activity trends:', error)
    return []
  }
}

/**
 * Get trending topics
 */
export async function getTrendingTopics(limit: number = 10) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('is_trending', true)
      .order('trend_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching trending topics:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching trending topics:', error)
    return []
  }
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limit: number = 20) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('engagement_activities')
      .select(`
        *,
        member:members(first_name, last_name, avatar_url)
      `)
      .order('occurred_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent activities:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }
}
