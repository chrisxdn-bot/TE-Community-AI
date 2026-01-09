-- =============================================================================
-- AI COMMUNITY ENGAGEMENT PLATFORM - DATABASE SCHEMA
-- =============================================================================
-- Version: 1.0
-- Date: 2026-01-08
-- Description: Complete database schema for community engagement platform
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Members table (central identity store)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    current_city VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url TEXT,
    years_with_te INTEGER,
    avatar_url TEXT,
    bio TEXT,
    is_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    engagement_score DECIMAL(5,2) DEFAULT 0.00,
    support_score DECIMAL(5,2) DEFAULT 0.00,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform identities (maps external platform users to members)
CREATE TABLE platform_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('slack', 'whatsapp', 'zoom', 'email')),
    platform_user_id VARCHAR(255) NOT NULL,
    platform_username VARCHAR(255),
    platform_display_name VARCHAR(255),
    platform_avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES members(id),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform, platform_user_id)
);

-- Pending identity matches (for admin review)
CREATE TABLE pending_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_identity_id UUID REFERENCES platform_identities(id) ON DELETE CASCADE,
    suggested_member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    match_reasons JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
    reviewed_by UUID REFERENCES members(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unified engagement activities log
CREATE TABLE engagement_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('slack', 'whatsapp', 'zoom', 'event', 'manual')),
    activity_type VARCHAR(50) NOT NULL,
    activity_subtype VARCHAR(50),
    activity_data JSONB DEFAULT '{}',
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    is_supportive BOOLEAN DEFAULT false,
    support_type VARCHAR(50),
    points_earned INTEGER DEFAULT 0,
    source_id VARCHAR(255),  -- Original ID from source platform
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- EVENT TABLES
-- =============================================================================

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'meetup' CHECK (event_type IN ('meetup', 'workshop', 'webinar', 'conference', 'social', 'other')),
    location VARCHAR(255),
    location_details TEXT,
    is_virtual BOOLEAN DEFAULT false,
    virtual_link TEXT,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    max_attendees INTEGER,
    qr_code_data VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event check-ins
CREATE TABLE event_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_in_method VARCHAR(50) DEFAULT 'qr' CHECK (check_in_method IN ('qr', 'manual', 'link', 'auto')),
    device_info JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, member_id)
);

-- =============================================================================
-- MEETING TABLES
-- =============================================================================

-- Zoom meetings (uploaded recordings)
CREATE TABLE zoom_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    recording_url TEXT,
    recording_file_path TEXT,
    recording_size_bytes BIGINT,
    transcript_url TEXT,
    transcription_status VARCHAR(20) DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
    transcription_error TEXT,
    ai_summary TEXT,
    topics_extracted JSONB DEFAULT '[]',
    total_speakers INTEGER,
    uploaded_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting participants (identified speakers)
CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES zoom_meetings(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    speaker_label VARCHAR(50) NOT NULL,
    identified_name VARCHAR(255),
    speaking_time_seconds INTEGER DEFAULT 0,
    speaking_percentage DECIMAL(5,2) DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    answers_given INTEGER DEFAULT 0,
    support_interactions INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id, speaker_label)
);

-- Transcript segments (individual speech segments)
CREATE TABLE transcript_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES zoom_meetings(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES meeting_participants(id) ON DELETE SET NULL,
    segment_index INTEGER NOT NULL,
    start_time_ms INTEGER NOT NULL,
    end_time_ms INTEGER NOT NULL,
    duration_ms INTEGER GENERATED ALWAYS AS (end_time_ms - start_time_ms) STORED,
    text TEXT NOT NULL,
    confidence DECIMAL(3,2),
    is_question BOOLEAN DEFAULT false,
    is_supportive BOOLEAN DEFAULT false,
    sentiment_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- MESSAGING TABLES
-- =============================================================================

-- Connected channels (Slack channels, WhatsApp groups)
CREATE TABLE connected_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('slack', 'whatsapp')),
    channel_id VARCHAR(255) NOT NULL,
    channel_name VARCHAR(255),
    channel_type VARCHAR(50),
    description TEXT,
    member_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_monitored BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    sync_cursor TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform, channel_id)
);

-- Messages (from Slack/WhatsApp)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES connected_channels(id) ON DELETE CASCADE,
    platform_message_id VARCHAR(255) NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    platform_user_id VARCHAR(255),
    content TEXT,
    content_preview VARCHAR(500),
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'media', 'file', 'reaction', 'reply', 'thread_reply')),
    parent_message_id UUID REFERENCES messages(id),
    thread_id VARCHAR(255),
    has_attachments BOOLEAN DEFAULT false,
    attachment_types JSONB,
    reaction_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    sentiment_score DECIMAL(3,2),
    is_supportive BOOLEAN DEFAULT false,
    support_type VARCHAR(50),
    topics_extracted JSONB DEFAULT '[]',
    raw_data JSONB,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, platform_message_id)
);

-- Message reactions
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    platform_user_id VARCHAR(255),
    reaction_type VARCHAR(100) NOT NULL,
    reacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, platform_user_id, reaction_type)
);

-- =============================================================================
-- ANALYTICS TABLES
-- =============================================================================

-- Topics (extracted from conversations)
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    mention_count INTEGER DEFAULT 0,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE,
    is_trending BOOLEAN DEFAULT false,
    trend_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topic mentions (linking topics to activities/messages)
CREATE TABLE topic_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES engagement_activities(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES zoom_meetings(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    context_snippet TEXT,
    mentioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (activity_id IS NOT NULL AND message_id IS NULL AND meeting_id IS NULL) OR
        (activity_id IS NULL AND message_id IS NOT NULL AND meeting_id IS NULL) OR
        (activity_id IS NULL AND message_id IS NULL AND meeting_id IS NOT NULL)
    )
);

-- Monthly analytics summaries
CREATE TABLE monthly_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month_year VARCHAR(7) NOT NULL,  -- '2025-01'
    platform VARCHAR(50),  -- NULL for overall
    channel_id UUID REFERENCES connected_channels(id) ON DELETE SET NULL,

    -- Activity counts
    total_messages INTEGER DEFAULT 0,
    total_reactions INTEGER DEFAULT 0,
    total_meetings INTEGER DEFAULT 0,
    total_meeting_minutes INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    total_checkins INTEGER DEFAULT 0,

    -- Member stats
    active_members INTEGER DEFAULT 0,
    new_members INTEGER DEFAULT 0,
    top_contributors JSONB DEFAULT '[]',
    top_supporters JSONB DEFAULT '[]',

    -- Topic stats
    top_topics JSONB DEFAULT '[]',

    -- Sentiment
    avg_sentiment DECIMAL(3,2),
    supportive_messages_count INTEGER DEFAULT 0,

    -- AI summary
    ai_summary TEXT,
    highlights JSONB DEFAULT '[]',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month_year, platform, channel_id)
);

-- Engagement score history (for tracking trends)
CREATE TABLE engagement_score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    score_type VARCHAR(50) NOT NULL CHECK (score_type IN ('overall', 'support', 'participation', 'consistency')),
    score DECIMAL(5,2) NOT NULL,
    components JSONB DEFAULT '{}',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI recommendations
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('member', 'community', 'admin')),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    action_data JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    dismissed_by UUID REFERENCES members(id),
    is_actioned BOOLEAN DEFAULT false,
    actioned_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SYSTEM TABLES
-- =============================================================================

-- Background job tracking
CREATE TABLE ai_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 5,
    input_data JSONB NOT NULL DEFAULT '{}',
    output_data JSONB,
    error_message TEXT,
    error_details JSONB,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration credentials (encrypted)
CREATE TABLE integration_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL UNIQUE,
    credentials JSONB NOT NULL,  -- Encrypted in application layer
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES members(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Members indexes
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_name ON members(first_name, last_name);
CREATE INDEX idx_members_city ON members(current_city);
CREATE INDEX idx_members_engagement ON members(engagement_score DESC);
CREATE INDEX idx_members_support ON members(support_score DESC);
CREATE INDEX idx_members_active ON members(is_active) WHERE is_active = true;
CREATE INDEX idx_members_search ON members USING gin(
    to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(current_city, ''))
);

-- Platform identities indexes
CREATE INDEX idx_platform_identities_member ON platform_identities(member_id);
CREATE INDEX idx_platform_identities_platform ON platform_identities(platform);
CREATE INDEX idx_platform_identities_unverified ON platform_identities(is_verified) WHERE is_verified = false;

-- Pending matches indexes
CREATE INDEX idx_pending_matches_status ON pending_matches(status) WHERE status = 'pending';
CREATE INDEX idx_pending_matches_confidence ON pending_matches(confidence_score DESC);

-- Activities indexes
CREATE INDEX idx_activities_member ON engagement_activities(member_id);
CREATE INDEX idx_activities_platform ON engagement_activities(platform);
CREATE INDEX idx_activities_type ON engagement_activities(activity_type);
CREATE INDEX idx_activities_occurred ON engagement_activities(occurred_at DESC);
CREATE INDEX idx_activities_supportive ON engagement_activities(is_supportive) WHERE is_supportive = true;

-- Events indexes
CREATE INDEX idx_events_date ON events(starts_at);
CREATE INDEX idx_events_qr ON events(qr_code_data);
CREATE INDEX idx_events_active ON events(is_active) WHERE is_active = true;

-- Checkins indexes
CREATE INDEX idx_checkins_event ON event_checkins(event_id);
CREATE INDEX idx_checkins_member ON event_checkins(member_id);

-- Meetings indexes
CREATE INDEX idx_meetings_date ON zoom_meetings(meeting_date DESC);
CREATE INDEX idx_meetings_status ON zoom_meetings(transcription_status);

-- Messages indexes
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_member ON messages(member_id);
CREATE INDEX idx_messages_sent ON messages(sent_at DESC);
CREATE INDEX idx_messages_supportive ON messages(is_supportive) WHERE is_supportive = true;

-- Topics indexes
CREATE INDEX idx_topics_trending ON topics(is_trending, trend_score DESC) WHERE is_trending = true;
CREATE INDEX idx_topics_name ON topics USING gin(to_tsvector('english', name));

-- Jobs indexes
CREATE INDEX idx_jobs_status ON ai_jobs(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_jobs_type ON ai_jobs(job_type);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER zoom_meetings_updated_at BEFORE UPDATE ON zoom_meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER connected_channels_updated_at BEFORE UPDATE ON connected_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update member's last_active_at when activity is recorded
CREATE OR REPLACE FUNCTION update_member_last_active()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.member_id IS NOT NULL THEN
        UPDATE members SET last_active_at = NEW.occurred_at
        WHERE id = NEW.member_id AND (last_active_at IS NULL OR last_active_at < NEW.occurred_at);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activity_updates_member AFTER INSERT ON engagement_activities
    FOR EACH ROW EXECUTE FUNCTION update_member_last_active();

-- Generate slug for topics
CREATE OR REPLACE FUNCTION generate_topic_slug()
RETURNS TRIGGER AS $$
BEGIN
    NEW.slug = LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topics_generate_slug BEFORE INSERT ON topics
    FOR EACH ROW EXECUTE FUNCTION generate_topic_slug();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM members
        WHERE id = auth.uid() AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Members policies
CREATE POLICY "Members are viewable by authenticated users"
    ON members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Members can update their own profile"
    ON members FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can insert members"
    ON members FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete members"
    ON members FOR DELETE
    TO authenticated
    USING (is_admin());

-- Platform identities policies
CREATE POLICY "Platform identities viewable by authenticated users"
    ON platform_identities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage platform identities"
    ON platform_identities FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Pending matches policies (admin only)
CREATE POLICY "Only admins can view pending matches"
    ON pending_matches FOR SELECT
    TO authenticated
    USING (is_admin());

CREATE POLICY "Only admins can manage pending matches"
    ON pending_matches FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Activities policies
CREATE POLICY "Activities are viewable by authenticated users"
    ON engagement_activities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only system can insert activities"
    ON engagement_activities FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Events policies
CREATE POLICY "Events are viewable by authenticated users"
    ON events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage events"
    ON events FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Event checkins policies
CREATE POLICY "Checkins are viewable by authenticated users"
    ON event_checkins FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Anyone can check in"
    ON event_checkins FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Messages and channels (authenticated view, admin manage)
CREATE POLICY "Messages viewable by authenticated users"
    ON messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Channels viewable by authenticated users"
    ON connected_channels FOR SELECT
    TO authenticated
    USING (true);

-- Topics (viewable by all authenticated)
CREATE POLICY "Topics are public"
    ON topics FOR SELECT
    TO authenticated
    USING (true);

-- AI recommendations
CREATE POLICY "Users can view their own recommendations"
    ON ai_recommendations FOR SELECT
    TO authenticated
    USING (member_id = auth.uid() OR target_type = 'community' OR is_admin());

-- Audit log (admin only)
CREATE POLICY "Only admins can view audit log"
    ON audit_log FOR SELECT
    TO authenticated
    USING (is_admin());

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
