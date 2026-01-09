# Supabase Database Setup

This directory contains the database schema and migration files for the AI Community Engagement Platform.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - Name: `community-platform` (or your preferred name)
   - Database Password: Choose a strong password (save this securely)
   - Region: Choose closest to your users
5. Click "Create new project"

### 2. Run the Schema

Once your project is created:

1. Go to the SQL Editor in your Supabase dashboard
2. Click "New Query"
3. Copy the contents of `schema.sql` and paste it into the editor
4. Click "Run" to execute the schema

This will create:
- ✅ All database tables
- ✅ Indexes for optimal query performance
- ✅ Triggers for automatic timestamp updates
- ✅ Row Level Security (RLS) policies
- ✅ Helper functions

### 3. Verify the Setup

After running the schema, verify it was successful:

1. Go to "Table Editor" in Supabase dashboard
2. You should see all tables listed:
   - `members` - Core member data
   - `platform_identities` - External platform links
   - `events` - Event management
   - `event_checkins` - Attendance tracking
   - `zoom_meetings` - Meeting records
   - `messages` - Chat messages
   - `topics` - AI-extracted topics
   - And more...

### 4. Get Your API Keys

1. Go to "Project Settings" > "API"
2. Copy the following values to your `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Create Your First Admin User

After authentication is set up, you'll need to manually set `is_admin = true` for your first user:

```sql
-- Run this in SQL Editor after creating your first user
UPDATE members
SET is_admin = true
WHERE email = 'your-email@example.com';
```

## Database Schema Overview

### Core Tables
- **members**: Central member directory with engagement scores
- **platform_identities**: Links members to Slack/WhatsApp/Zoom identities
- **engagement_activities**: Unified activity log across all platforms

### Event Tables
- **events**: Event definitions with QR codes
- **event_checkins**: Attendance tracking

### Meeting Tables
- **zoom_meetings**: Uploaded recordings and transcripts
- **meeting_participants**: Speaker identification and stats
- **transcript_segments**: Individual speech segments with AI analysis

### Messaging Tables
- **connected_channels**: Slack/WhatsApp channels
- **messages**: All messages with sentiment analysis
- **message_reactions**: Reaction tracking

### Analytics Tables
- **topics**: AI-extracted discussion topics
- **monthly_summaries**: Pre-computed analytics
- **engagement_score_history**: Score trends over time
- **ai_recommendations**: Personalized suggestions

## Row Level Security (RLS)

The schema includes comprehensive RLS policies:

- **Members**: Everyone can view, users can update their own profile, admins can manage
- **Activities**: Everyone can view, only admins can insert
- **Events**: Everyone can view and check in, admins can manage
- **Messages**: Everyone can view, system processes can insert
- **Admin Tables**: Admin-only access for sensitive operations

## Indexes

Optimized indexes are created for:
- Fast member search by name, email, location
- Quick engagement score lookups
- Efficient time-based queries
- Full-text search capabilities

## Next Steps

1. Set up authentication (see main README.md)
2. Import your first members via CSV
3. Create your first event
4. Connect Slack/WhatsApp integrations (Phase 4-5)
