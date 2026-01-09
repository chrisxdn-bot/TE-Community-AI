/**
 * Claude AI Integration
 * Uses Anthropic's Claude API for sentiment analysis, topic extraction, and recommendations
 */

export interface SentimentAnalysis {
  score: number // -1 to 1
  label: 'positive' | 'neutral' | 'negative'
  is_supportive: boolean
  support_type?: 'question_answer' | 'encouragement' | 'help_offer' | 'advice' | 'appreciation'
}

export interface TopicExtraction {
  topics: string[]
  categories: string[]
  keywords: string[]
}

export interface CommunityInsights {
  summary: string
  highlights: string[]
  recommendations: string[]
  top_contributors: string[]
  trending_topics: string[]
  sentiment_overview: string
}

/**
 * Analyze sentiment of a message using Claude
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: `Analyze the sentiment and supportiveness of this message. Return a JSON object with:
- score (number from -1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
- label (one of: positive, neutral, negative)
- is_supportive (boolean: true if the message helps, encourages, or supports others)
- support_type (if supportive, one of: question_answer, encouragement, help_offer, advice, appreciation, or null)

Message: "${text}"

Return only valid JSON, no other text.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    // Parse JSON response
    const result = JSON.parse(content)

    return result as SentimentAnalysis
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    // Return default neutral sentiment on error
    return {
      score: 0,
      label: 'neutral',
      is_supportive: false,
    }
  }
}

/**
 * Extract topics from a collection of messages
 */
export async function extractTopics(messages: string[]): Promise<TopicExtraction> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  try {
    const combinedText = messages.join('\n---\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `Analyze these messages and extract key topics, categories, and keywords. Return a JSON object with:
- topics (array of main topics discussed, max 10)
- categories (array of high-level categories like "technology", "business", "personal", max 5)
- keywords (array of important keywords, max 15)

Messages:
${combinedText}

Return only valid JSON, no other text.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    const result = JSON.parse(content)

    return result as TopicExtraction
  } catch (error) {
    console.error('Error extracting topics:', error)
    return {
      topics: [],
      categories: [],
      keywords: [],
    }
  }
}

/**
 * Generate community insights and recommendations
 */
export async function generateCommunityInsights(data: {
  memberCount: number
  messageCount: number
  topContributors: Array<{ name: string; messageCount: number }>
  recentTopics: string[]
  averageSentiment: number
}): Promise<CommunityInsights> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `You are a community engagement analyst. Analyze this community data and provide insights.

Community Data:
- Total Members: ${data.memberCount}
- Total Messages (last 30 days): ${data.messageCount}
- Average Sentiment: ${data.averageSentiment.toFixed(2)} (scale: -1 to 1)
- Top Contributors: ${data.topContributors.map(c => `${c.name} (${c.messageCount} messages)`).join(', ')}
- Recent Topics: ${data.recentTopics.join(', ')}

Provide a JSON response with:
- summary (string: 2-3 sentence overview of community health)
- highlights (array of 3-5 positive observations)
- recommendations (array of 3-5 actionable suggestions to improve engagement)
- top_contributors (array of contributor names from the data)
- trending_topics (array of the most relevant topics)
- sentiment_overview (string: 1-2 sentence interpretation of the sentiment score)

Return only valid JSON, no other text.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const result = await response.json()
    const content = result.content[0].text

    const insights = JSON.parse(content)

    return insights as CommunityInsights
  } catch (error) {
    console.error('Error generating insights:', error)
    return {
      summary: 'Unable to generate insights at this time.',
      highlights: [],
      recommendations: [],
      top_contributors: [],
      trending_topics: [],
      sentiment_overview: 'Sentiment data unavailable',
    }
  }
}

/**
 * Generate recognition post for a member
 */
export async function generateRecognitionPost(member: {
  name: string
  contributions: string[]
  stats: {
    messageCount: number
    helpfulInteractions: number
    eventsAttended: number
  }
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `Write a warm, genuine recognition post for a community member. Make it engaging and specific.

Member: ${member.name}
Key Contributions:
${member.contributions.map(c => `- ${c}`).join('\n')}

Stats:
- ${member.stats.messageCount} messages shared
- ${member.stats.helpfulInteractions} helpful interactions
- ${member.stats.eventsAttended} events attended

Write a 3-4 sentence recognition post that:
1. Thanks them genuinely
2. Highlights specific contributions
3. Mentions their impact on the community
4. Keeps a warm, authentic tone

Return only the post text, no quotes or formatting.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const data = await response.json()
    const post = data.content[0].text.trim()

    return post
  } catch (error) {
    console.error('Error generating recognition post:', error)
    return `We want to recognize ${member.name} for their amazing contributions to our community! Thank you for being such an active and supportive member!`
  }
}
