# AI Community Engagement Platform
## Technical Specification Document

**Version**: 1.0
**Date**: January 8, 2026
**Status**: Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Technical Architecture](#3-technical-architecture)
4. [Database Design](#4-database-design)
5. [Feature Specifications](#5-feature-specifications)
6. [API Design](#6-api-design)
7. [AI Integration](#7-ai-integration)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [Security & Authentication](#9-security--authentication)
10. [User Interface Design](#10-user-interface-design)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Cost Estimates](#12-cost-estimates)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 Purpose

Build a comprehensive AI-powered platform to track and analyze community engagement across multiple communication channels (WhatsApp, Slack, Zoom, in-person events) for a community of 500+ members. The platform will provide actionable insights, identify top contributors, and generate recommendations for community growth.

### 1.2 Key Objectives

- **Centralized Member Database**: Single source of truth for all member information
- **Cross-Platform Engagement Tracking**: Unified view of member activity across all channels
- **AI-Powered Insights**: Automated topic extraction, sentiment analysis, and recommendations
- **Recognition System**: Easy identification and celebration of supportive community members
- **Event Management**: QR-based check-in system for in-person events

### 1.3 Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | Next.js 14 (App Router) | Server components, excellent DX, Vercel integration |
| Database | Supabase (PostgreSQL) | Managed Postgres, built-in auth, real-time, storage |
| Hosting | Vercel | Native Next.js support, edge functions, global CDN |
| AI - Transcription | OpenAI Whisper | Industry-leading accuracy, speaker diarization |
| AI - Analysis | Claude API (Anthropic) | Superior reasoning for sentiment/recommendations |
| Messaging | Twilio (WhatsApp), Slack API | Reliable, well-documented APIs |

---

## 2. Project Overview

### 2.1 Problem Statement

Managing a 500+ member community across multiple platforms (WhatsApp groups, Slack channels, Zoom meetings, in-person events) creates significant challenges:

1. **Fragmented Data**: Member activity is scattered across platforms with no unified view
2. **Manual Tracking**: Engagement metrics require manual compilation
3. **Recognition Gaps**: Supportive members often go unnoticed
4. **Growth Blind Spots**: Lack of data-driven insights for community growth

### 2.2 Solution Overview

A centralized platform that:

- Aggregates member data from all communication channels
- Automatically tracks engagement metrics using AI
- Identifies trending topics and supportive interactions
- Provides copy-paste ready recognition posts
- Generates personalized engagement recommendations

### 2.3 Target Users

| User Type | Description | Primary Use Cases |
|-----------|-------------|-------------------|
| Community Admin | Platform owner/manager | Dashboard viewing, member management, recognition |
| Community Moderator | Assists with management | Event check-ins, content review |
| Community Member | Regular participant | Event check-in, profile viewing |

### 2.4 Success Metrics

- **Adoption**: 80%+ of members linked across platforms within 3 months
- **Engagement Visibility**: 100% of activities across channels captured
- **Time Savings**: 10+ hours/week saved on manual tracking
- **Recognition**: 4+ member recognition posts generated monthly

---

## 3. Technical Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENTS                                     │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│   Web Dashboard │   Mobile PWA    │   Admin Panel   │  Public Check-in      │
│   (Next.js SSR) │   (Next.js)     │   (Next.js)     │  (Next.js)            │
└────────┬────────┴────────┬────────┴────────┬────────┴───────────┬───────────┘
         │                 │                 │                    │
         └─────────────────┴─────────────────┴────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VERCEL EDGE NETWORK                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  Next.js App    │  │  API Routes     │  │  Edge Middleware            │  │
│  │  (App Router)   │  │  (/api/*)       │  │  (Auth, Rate Limiting)      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE PLATFORM                               │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│   PostgreSQL    │   Supabase Auth │   Storage       │   Realtime            │
│   Database      │   (JWT/Magic)   │   (Files)       │   (WebSocket)         │
├─────────────────┴─────────────────┴─────────────────┴───────────────────────┤
│   Row Level Security (RLS)  │  Edge Functions  │  Database Webhooks         │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKGROUND PROCESSING                               │
├─────────────────────────────────────────────────────────────────────────────┤
│   Inngest / Trigger.dev (Serverless Job Queue)                              │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│   │ Transcription│ │  Sentiment   │ │    Topic     │ │   Identity   │      │
│   │    Jobs      │ │  Analysis    │ │  Extraction  │ │   Matching   │      │
│   └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             AI SERVICES                                      │
├─────────────────┬─────────────────┬─────────────────────────────────────────┤
│   OpenAI        │   Anthropic     │   OpenAI                                │
│   Whisper API   │   Claude API    │   Embeddings                            │
│   (Audio→Text)  │   (Analysis)    │   (Matching)                            │
└─────────────────┴─────────────────┴─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                                 │
├─────────────────┬─────────────────┬─────────────────────────────────────────┤
│   Slack API     │   Twilio        │   (Future: Calendar APIs)               │
│   (Bot + OAuth) │   (WhatsApp)    │                                         │
└─────────────────┴─────────────────┴─────────────────────────────────────────┘
```

### 3.2 Data Flow Diagrams

#### 3.2.1 Meeting Recording Processing

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Admin  │────▶│  Upload │────▶│ Storage │────▶│  Queue  │────▶│ Whisper │
│ Browser │     │   API   │     │(Supabase)│    │(Inngest)│     │   API   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └────┬────┘
                                                                      │
                                                                      ▼
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│Dashboard│◀────│Realtime │◀────│ Update  │◀────│  Store  │◀────│Diarize +│
│  View   │     │(Supabase)│    │  Score  │     │Transcript│    │ Analyze │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
```

#### 3.2.2 Message Sync (Slack/WhatsApp)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Slack/    │────▶│   Webhook   │────▶│   Queue     │────▶│  Sentiment  │
│  WhatsApp   │     │  Endpoint   │     │  Message    │     │  Analysis   │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                                                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │◀────│   Update    │◀────│   Store     │◀────│   Topic     │
│   Widget    │     │   Scores    │     │   Message   │     │ Extraction  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 3.3 Directory Structure

```
community-platform/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth routes (grouped, no layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/                  # Protected dashboard routes
│   │   ├── layout.tsx                # Sidebar + header layout
│   │   ├── page.tsx                  # Main dashboard
│   │   │
│   │   ├── members/
│   │   │   ├── page.tsx              # Member directory
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Member profile
│   │   │   ├── import/
│   │   │   │   └── page.tsx          # CSV import
│   │   │   └── leaderboard/
│   │   │       └── page.tsx          # Top members
│   │   │
│   │   ├── events/
│   │   │   ├── page.tsx              # Event list
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create event
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Event details
│   │   │       └── attendees/
│   │   │           └── page.tsx      # Attendee list
│   │   │
│   │   ├── meetings/
│   │   │   ├── page.tsx              # Meeting list
│   │   │   ├── upload/
│   │   │   │   └── page.tsx          # Upload recording
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Meeting details
│   │   │
│   │   ├── integrations/
│   │   │   ├── page.tsx              # Integration overview
│   │   │   ├── slack/
│   │   │   │   └── page.tsx          # Slack settings
│   │   │   └── whatsapp/
│   │   │       └── page.tsx          # WhatsApp settings
│   │   │
│   │   ├── analytics/
│   │   │   ├── page.tsx              # Analytics dashboard
│   │   │   └── topics/
│   │   │       └── page.tsx          # Topic analysis
│   │   │
│   │   ├── identity/
│   │   │   └── page.tsx              # Identity reconciliation
│   │   │
│   │   └── settings/
│   │       └── page.tsx              # App settings
│   │
│   ├── checkin/                      # Public routes (no auth)
│   │   └── [eventId]/
│   │       └── page.tsx              # QR check-in page
│   │
│   ├── api/                          # API routes
│   │   ├── members/
│   │   │   ├── route.ts              # GET (list), POST (create)
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET, PUT, DELETE
│   │   │   ├── import/
│   │   │   │   └── route.ts          # POST CSV import
│   │   │   └── search/
│   │   │       └── route.ts          # GET search
│   │   │
│   │   ├── events/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── qr/
│   │   │       │   └── route.ts      # GET QR code
│   │   │       └── checkin/
│   │   │           └── route.ts      # POST check-in
│   │   │
│   │   ├── meetings/
│   │   │   ├── route.ts
│   │   │   ├── upload/
│   │   │   │   └── route.ts          # POST upload
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── transcribe/
│   │   │       │   └── route.ts      # POST trigger
│   │   │       └── participants/
│   │   │           └── route.ts      # GET/PUT
│   │   │
│   │   ├── slack/
│   │   │   ├── oauth/
│   │   │   │   └── route.ts
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   └── events/
│   │   │       └── route.ts          # Webhook
│   │   │
│   │   ├── whatsapp/
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   │
│   │   ├── identity/
│   │   │   ├── pending/
│   │   │   │   └── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts          # PUT approve/reject
│   │   │
│   │   ├── analytics/
│   │   │   ├── engagement/
│   │   │   │   └── route.ts
│   │   │   └── topics/
│   │   │       └── route.ts
│   │   │
│   │   └── ai/
│   │       ├── transcribe/
│   │       │   └── route.ts
│   │       └── analyze/
│   │           └── route.ts
│   │
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
│
├── components/
│   ├── ui/                           # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── mobile-nav.tsx
│   │   └── page-header.tsx
│   │
│   ├── members/
│   │   ├── member-card.tsx
│   │   ├── member-list.tsx
│   │   ├── member-search.tsx
│   │   ├── member-profile.tsx
│   │   ├── engagement-badge.tsx
│   │   └── csv-import-form.tsx
│   │
│   ├── events/
│   │   ├── event-card.tsx
│   │   ├── event-form.tsx
│   │   ├── qr-display.tsx
│   │   ├── qr-scanner.tsx
│   │   └── attendee-list.tsx
│   │
│   ├── meetings/
│   │   ├── meeting-card.tsx
│   │   ├── upload-form.tsx
│   │   ├── transcript-viewer.tsx
│   │   ├── speaker-stats.tsx
│   │   └── participant-mapper.tsx
│   │
│   ├── integrations/
│   │   ├── slack-connect.tsx
│   │   ├── whatsapp-connect.tsx
│   │   └── sync-status.tsx
│   │
│   ├── analytics/
│   │   ├── engagement-chart.tsx
│   │   ├── leaderboard.tsx
│   │   ├── topic-cloud.tsx
│   │   ├── support-highlights.tsx
│   │   └── recommendation-card.tsx
│   │
│   ├── identity/
│   │   ├── match-review-card.tsx
│   │   ├── match-list.tsx
│   │   └── confidence-meter.tsx
│   │
│   └── shared/
│       ├── loading-skeleton.tsx
│       ├── empty-state.tsx
│       ├── error-boundary.tsx
│       └── pagination.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   ├── admin.ts                  # Service role client
│   │   └── middleware.ts             # Auth middleware
│   │
│   ├── ai/
│   │   ├── openai.ts                 # OpenAI client config
│   │   ├── anthropic.ts              # Claude client config
│   │   ├── transcription.ts          # Whisper integration
│   │   ├── sentiment.ts              # Sentiment analysis
│   │   ├── topics.ts                 # Topic extraction
│   │   ├── matching.ts               # Identity matching
│   │   └── recommendations.ts        # AI recommendations
│   │
│   ├── integrations/
│   │   ├── slack.ts                  # Slack API helpers
│   │   └── twilio.ts                 # Twilio/WhatsApp helpers
│   │
│   ├── scoring/
│   │   └── engagement.ts             # Score calculation
│   │
│   └── utils/
│       ├── cn.ts                     # Class name utility
│       ├── date.ts                   # Date formatting
│       └── csv.ts                    # CSV parsing
│
├── hooks/
│   ├── use-members.ts
│   ├── use-events.ts
│   ├── use-meetings.ts
│   └── use-realtime.ts
│
├── types/
│   ├── database.ts                   # Supabase generated types
│   ├── api.ts                        # API request/response types
│   └── index.ts                      # Shared types
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_indexes.sql
│   │   └── 003_rls_policies.sql
│   ├── seed.sql
│   └── config.toml
│
├── inngest/
│   ├── client.ts
│   └── functions/
│       ├── transcribe-meeting.ts
│       ├── analyze-messages.ts
│       ├── calculate-scores.ts
│       └── generate-recommendations.ts
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── .env.local.example
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ENTITY RELATIONSHIPS                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │     MEMBERS     │
                              │─────────────────│
                              │ id (PK)         │
                              │ email           │
                              │ first_name      │
                              │ last_name       │
                              │ current_city    │
                              │ phone           │
                              │ linkedin_url    │
                              │ years_with_te   │
                              │ is_admin        │
                              │ engagement_score│
                              │ support_score   │
                              └────────┬────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ PLATFORM_IDENTITIES │  │ ENGAGEMENT_ACTIVITIES│  │   EVENT_CHECKINS    │
│─────────────────────│  │─────────────────────│  │─────────────────────│
│ id (PK)             │  │ id (PK)             │  │ id (PK)             │
│ member_id (FK)      │  │ member_id (FK)      │  │ event_id (FK)       │
│ platform            │  │ platform            │  │ member_id (FK)      │
│ platform_user_id    │  │ activity_type       │  │ checked_in_at       │
│ platform_display    │  │ is_supportive       │  └──────────┬──────────┘
│ is_verified         │  │ points_earned       │             │
│ confidence_score    │  │ occurred_at         │             │
└─────────────────────┘  └─────────────────────┘             │
                                                              │
                              ┌─────────────────┐             │
                              │     EVENTS      │◀────────────┘
                              │─────────────────│
                              │ id (PK)         │
                              │ title           │
                              │ event_date      │
                              │ location        │
                              │ qr_code_data    │
                              │ created_by (FK) │
                              └─────────────────┘

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   ZOOM_MEETINGS     │  │ MEETING_PARTICIPANTS│  │ TRANSCRIPT_SEGMENTS │
│─────────────────────│  │─────────────────────│  │─────────────────────│
│ id (PK)             │◀─│ meeting_id (FK)     │◀─│ meeting_id (FK)     │
│ title               │  │ member_id (FK)      │  │ participant_id (FK) │
│ meeting_date        │  │ speaker_label       │  │ start_time_ms       │
│ recording_url       │  │ speaking_time_sec   │  │ end_time_ms         │
│ transcript_status   │  │ word_count          │  │ text                │
│ ai_summary          │  │ support_interactions│  │ is_supportive       │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ CONNECTED_CHANNELS  │  │      MESSAGES       │
│─────────────────────│  │─────────────────────│
│ id (PK)             │◀─│ channel_id (FK)     │
│ platform            │  │ member_id (FK)      │
│ channel_id          │  │ content             │
│ channel_name        │  │ sentiment_score     │
│ is_active           │  │ is_supportive       │
│ last_synced_at      │  │ sent_at             │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│      TOPICS         │  │   TOPIC_MENTIONS    │
│─────────────────────│  │─────────────────────│
│ id (PK)             │◀─│ topic_id (FK)       │
│ name                │  │ activity_id (FK)    │
│ mention_count       │  │ platform            │
│ is_trending         │  │ mentioned_at        │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│   PENDING_MATCHES   │  │  AI_RECOMMENDATIONS │
│─────────────────────│  │─────────────────────│
│ id (PK)             │  │ id (PK)             │
│ platform_identity_id│  │ member_id (FK)      │
│ suggested_member_id │  │ recommendation_type │
│ confidence_score    │  │ title               │
│ match_reasons       │  │ description         │
│ status              │  │ priority            │
│ reviewed_by         │  │ is_dismissed        │
└─────────────────────┘  └─────────────────────┘
```

### 4.2 Complete Schema SQL

```sql
-- =============================================================================
-- AI COMMUNITY ENGAGEMENT PLATFORM - DATABASE SCHEMA
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
```

### 4.3 Data Types Reference

| Column Type | PostgreSQL Type | Description |
|-------------|-----------------|-------------|
| UUID | `UUID` | Primary keys and foreign keys |
| Short text | `VARCHAR(n)` | Names, titles, short strings |
| Long text | `TEXT` | Descriptions, content, summaries |
| Email | `VARCHAR(255)` | Email addresses |
| URL | `TEXT` | URLs and links |
| Phone | `VARCHAR(50)` | Phone numbers (international format) |
| Boolean | `BOOLEAN` | True/false flags |
| Integer | `INTEGER` | Counts, durations |
| Decimal | `DECIMAL(5,2)` | Scores (0.00-999.99) |
| Decimal (normalized) | `DECIMAL(3,2)` | Scores (-1.00 to 1.00) |
| Timestamp | `TIMESTAMP WITH TIME ZONE` | All date/times |
| JSON | `JSONB` | Flexible structured data |

---

## 5. Feature Specifications

### 5.1 Member Management

#### 5.1.1 Member Directory

**Purpose**: Central view of all community members with search and filtering.

**User Stories**:
- As an admin, I want to search members by name, email, or location
- As an admin, I want to filter members by engagement level
- As an admin, I want to see member engagement scores at a glance
- As an admin, I want to sort members by various criteria

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| MEM-001 | Display paginated list of members (25 per page) | P0 |
| MEM-002 | Search by first name, last name, email | P0 |
| MEM-003 | Filter by location (city) | P1 |
| MEM-004 | Filter by engagement score range | P1 |
| MEM-005 | Sort by name, engagement score, join date | P0 |
| MEM-006 | Display member card with avatar, name, location, score | P0 |
| MEM-007 | Click to view full member profile | P0 |
| MEM-008 | Export filtered results to CSV | P2 |

**UI Mockup**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Members                                              [+ Add Member] │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐  ┌───────────┐  ┌────────────┐ │
│ │ 🔍 Search members...            │  │ Location ▼│  │ Score ▼   │ │
│ └─────────────────────────────────┘  └───────────┘  └────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Showing 1-25 of 523 members                     Sort: Score (High) │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤  Sarah Chen          San Francisco    ⭐ 94.5    🤝 87.2     │ │
│ │     Senior Developer    5 years          Messages: 234          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👤  Mike Johnson        New York         ⭐ 91.2    🤝 92.1     │ │
│ │     Product Manager     3 years          Messages: 189          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ...                                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                         < 1 2 3 ... 21 >                           │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.1.2 Member Profile

**Purpose**: Detailed view of individual member with activity history.

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| PRO-001 | Display all member information fields | P0 |
| PRO-002 | Show engagement score breakdown | P0 |
| PRO-003 | Display linked platform identities | P0 |
| PRO-004 | Show activity timeline (last 30 days) | P1 |
| PRO-005 | Display meeting attendance history | P1 |
| PRO-006 | Show event check-in history | P1 |
| PRO-007 | Edit member details (admin only) | P0 |
| PRO-008 | Link/unlink platform identities (admin) | P1 |

**UI Mockup**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Members                                      [Edit] [...] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│     ┌─────┐                                                          │
│     │ 👤  │  Sarah Chen                                              │
│     └─────┘  Senior Developer • San Francisco                        │
│              sarah.chen@email.com • 5 years with community           │
│              [LinkedIn ↗]                                            │
│                                                                      │
├────────────────────────┬────────────────────────────────────────────┤
│  ENGAGEMENT SCORE      │  SUPPORT SCORE                             │
│  ┌────────────────┐    │  ┌────────────────┐                        │
│  │     94.5       │    │  │     87.2       │                        │
│  ���   ████████░░   │    │  │   ███████░░░   │                        │
│  └────────────────┘    │  └────────────────┘                        │
├────────────────────────┴────────────────────────────────────────────┤
│ CONNECTED PLATFORMS                                                  │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                            │
│ │ Slack ✓  │  │WhatsApp ✓│  │ Zoom ⚠️  │                            │
│ │@schen    │  │+1 555... │  │Unverified│                            │
│ └──────────┘  └──────────┘  └──────────┘                            │
├─────────────────────────────────────────────────────────────────────┤
│ RECENT ACTIVITY                                    View All →        │
├─────────────────────────────────────────────────────────────────────┤
│ Today     💬 Sent 12 messages in #general                           │
│ Yesterday 🎤 Spoke for 15 mins in Weekly Sync                       │
│ Jan 5     ✅ Checked in to NYC Meetup                               │
│ Jan 3     🤝 Helped 3 members with onboarding questions             │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.1.3 CSV Import

**Purpose**: Bulk import members from spreadsheet.

**Expected CSV Format**:
```csv
First Name,Last Name,Current City,Phone,Email,Years with TE
Sarah,Chen,San Francisco,+1-555-0101,sarah@email.com,5
Mike,Johnson,New York,+1-555-0102,mike@email.com,3
```

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| IMP-001 | Upload CSV file (max 5MB) | P0 |
| IMP-002 | Auto-detect column mapping | P0 |
| IMP-003 | Preview first 10 rows before import | P0 |
| IMP-004 | Validate email uniqueness | P0 |
| IMP-005 | Skip duplicates option | P1 |
| IMP-006 | Show import progress | P1 |
| IMP-007 | Report import results (success/failed) | P0 |

### 5.2 Event Check-in System

#### 5.2.1 Event Management

**Purpose**: Create and manage community events.

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| EVT-001 | Create event with title, date, location | P0 |
| EVT-002 | Set event type (meetup, workshop, etc.) | P1 |
| EVT-003 | Auto-generate unique QR code | P0 |
| EVT-004 | Display QR code for printing/sharing | P0 |
| EVT-005 | View attendee list with check-in times | P0 |
| EVT-006 | Export attendee list | P2 |
| EVT-007 | Edit/cancel events | P1 |

#### 5.2.2 QR Check-in Flow

**Purpose**: Allow members to check in via QR scan.

**User Flow**:
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Member     │────▶│  Scan QR     │────▶│ Select Name  │────▶│ Confirmed!   │
│ Arrives      │     │  with Phone  │     │ from List    │     │ Check-in     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| CHK-001 | Mobile-friendly check-in page | P0 |
| CHK-002 | No login required for check-in | P0 |
| CHK-003 | Search member by name | P0 |
| CHK-004 | Confirm check-in with success message | P0 |
| CHK-005 | Prevent duplicate check-ins | P0 |
| CHK-006 | Log engagement activity | P0 |

**Check-in Page Mockup**:
```
┌─────────────────────────────────────┐
│         NYC January Meetup          │
│         📍 WeWork Times Square      │
├─────────────────────────────────────┤
│                                     │
│   Welcome! Please find your name    │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🔍 Search your name...      │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Sarah Chen                  │   │
│   │ Mike Johnson                │   │
│   │ Emily Davis                 │   │
│   │ ...                         │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 5.3 Zoom Meeting Processing

#### 5.3.1 Recording Upload

**Purpose**: Upload Zoom recordings for AI processing.

**Supported Formats**: MP4, WebM, M4A, WAV (max 2GB)

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| UPL-001 | Drag-and-drop file upload | P0 |
| UPL-002 | Show upload progress | P0 |
| UPL-003 | Set meeting title and date | P0 |
| UPL-004 | Trigger transcription job | P0 |
| UPL-005 | Show processing status | P0 |
| UPL-006 | Resume failed uploads | P2 |

#### 5.3.2 Transcription & Analysis

**Purpose**: AI-powered meeting analysis.

**Processing Pipeline**:
1. Upload audio/video to Supabase Storage
2. Trigger Inngest job for processing
3. Send to OpenAI Whisper API with diarization
4. Store transcript segments with speaker labels
5. Run Claude analysis for topics/sentiment
6. Map speakers to members (with confidence scoring)
7. Calculate speaking metrics

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| TRN-001 | Transcribe audio with speaker diarization | P0 |
| TRN-002 | Calculate speaking time per speaker | P0 |
| TRN-003 | Identify speakers by name (from audio) | P1 |
| TRN-004 | Extract discussion topics | P1 |
| TRN-005 | Detect supportive interactions | P2 |
| TRN-006 | Generate meeting summary | P1 |

#### 5.3.3 Speaker Mapping

**Purpose**: Link transcript speakers to member database.

**Matching Algorithm**:
1. Check if speaker introduces themselves ("Hi, I'm Sarah")
2. Compare voice patterns to previous meetings (future)
3. Use name similarity scoring against member database
4. Present matches with confidence scores
5. Admin confirms/corrects mappings

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| SPK-001 | Auto-suggest member matches | P1 |
| SPK-002 | Show confidence percentage | P1 |
| SPK-003 | Manual member selection dropdown | P0 |
| SPK-004 | Mark speakers as "Guest" (non-member) | P1 |
| SPK-005 | Remember mappings for future meetings | P2 |

### 5.4 Slack Integration

#### 5.4.1 Workspace Connection

**Purpose**: Connect Slack workspace via OAuth.

**Required Scopes**:
- `channels:history` - Read channel messages
- `channels:read` - List channels
- `reactions:read` - Read reactions
- `users:read` - Read user profiles
- `users:read.email` - Read user emails

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| SLK-001 | OAuth flow to connect workspace | P0 |
| SLK-002 | Select channels to monitor | P0 |
| SLK-003 | Initial historical sync (last 30 days) | P1 |
| SLK-004 | Real-time message webhook | P0 |
| SLK-005 | Disconnect workspace | P1 |

#### 5.4.2 Message Tracking

**Purpose**: Track and analyze Slack messages.

**Tracked Data**:
- Message content (for analysis, not stored long-term)
- Sender (platform_user_id)
- Channel
- Timestamp
- Reactions received
- Thread participation

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| MSG-001 | Store message metadata | P0 |
| MSG-002 | Run sentiment analysis | P1 |
| MSG-003 | Detect supportive messages | P1 |
| MSG-004 | Extract topics | P1 |
| MSG-005 | Track reaction counts | P2 |

#### 5.4.3 User Mapping

**Purpose**: Link Slack users to member database.

**Matching Approach**:
1. Match by email (most reliable)
2. Match by display name similarity
3. Queue uncertain matches for admin review

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| USR-001 | Auto-match by email | P0 |
| USR-002 | Suggest matches by name | P1 |
| USR-003 | Queue uncertain matches for review | P0 |
| USR-004 | Manual linking UI | P0 |

### 5.5 WhatsApp Integration

#### 5.5.1 Twilio Setup

**Purpose**: Connect WhatsApp via Twilio Business API.

**Prerequisites**:
- Twilio account with WhatsApp enabled
- Approved WhatsApp Business number
- Webhook endpoint for incoming messages

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| TWL-001 | Configure Twilio webhook | P0 |
| TWL-002 | Receive incoming messages | P0 |
| TWL-003 | Store message metadata | P0 |
| TWL-004 | Map phone numbers to members | P0 |

#### 5.5.2 Message Analysis

**Purpose**: Analyze WhatsApp group messages.

**Note**: WhatsApp Business API has limitations - only messages sent to the business number are received. Full group monitoring requires workarounds.

**Alternative Approaches**:
1. **Designated Reporter**: Have a community manager forward summaries
2. **Export Processing**: Periodically upload WhatsApp chat exports
3. **Bot in Group**: If business number is added to group

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| WHA-001 | Process incoming webhook messages | P0 |
| WHA-002 | Run sentiment analysis | P1 |
| WHA-003 | Detect supportive messages | P1 |
| WHA-004 | Map phone to member | P0 |

### 5.6 Identity Reconciliation

#### 5.6.1 Matching System

**Purpose**: Link identities across platforms to single member.

**Matching Algorithm**:
```
Input: New platform identity (platform, platform_user_id, display_name, email?)

1. Exact email match → confidence: 1.0
2. Name exact match → confidence: 0.9
3. Name fuzzy match (>80% similarity) → confidence: 0.7
4. Partial name match → confidence: 0.5
5. No match → create pending match for review

Output: Suggested member_id + confidence_score + match_reasons
```

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| MAT-001 | Auto-link high-confidence matches (>0.95) | P1 |
| MAT-002 | Queue lower confidence for review | P0 |
| MAT-003 | Store match reasoning | P1 |
| MAT-004 | Allow manual override | P0 |

#### 5.6.2 Admin Review Interface

**Purpose**: Review and approve/reject identity matches.

**UI Mockup**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Identity Reconciliation                          12 pending matches │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Slack: @sarahc                                   Confidence: 87%│ │
│ │ Display: "Sarah C."                                             │ │
│ │ ─────────────────────────────────────────────                   │ │
│ │ Suggested Match: Sarah Chen (sarah@email.com)                   │ │
│ │                                                                 │ │
│ │ Match Reasons:                                                  │ │
│ │ • Name similarity: 85%                                          │ │
│ │ • Same email domain: ✓                                          │ │
│ │                                                                 │ │
│ │ [✓ Approve]  [✗ Reject]  [🔄 Different Member ▼]               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ WhatsApp: +1-555-0199                           Confidence: 45% │ │
│ │ ...                                                             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| REV-001 | List pending matches sorted by confidence | P0 |
| REV-002 | Show match reasoning details | P1 |
| REV-003 | Approve with one click | P0 |
| REV-004 | Reject with one click | P0 |
| REV-005 | Select different member from dropdown | P0 |
| REV-006 | Bulk approve high-confidence matches | P2 |

### 5.7 Analytics Dashboard

#### 5.7.1 Main Dashboard

**Purpose**: Overview of community engagement.

**Dashboard Widgets**:
1. **Engagement Summary**: Total members, active this month, trend
2. **Top Engaged Members**: Leaderboard (top 10)
3. **Most Supportive Members**: Recognition-ready list
4. **Trending Topics**: This month's hot topics
5. **Recent Activity**: Live feed of community activity
6. **AI Recommendations**: Suggested actions

**UI Mockup**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Dashboard                                              January 2025         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐│
│  │ 523 Members   │  │ 342 Active    │  │ 1,234 Messages│  │ 8 Events      ││
│  │ +12 this mo.  │  │ 65% of total  │  │ +23% vs last  │  │ 156 check-ins ││
│  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘│
│                                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────────┐│
│  │ 🏆 TOP ENGAGED               │  │ 🤝 MOST SUPPORTIVE                   ││
│  │ ───────────────────────────  │  │ ──────────────────────────────────── ││
│  │ 1. Sarah Chen      94.5 ⭐   │  │ 1. Mike Johnson    "Helped 23 members││
│  │ 2. Mike Johnson    91.2 ⭐   │  │    answer questions this month"      ││
│  │ 3. Emily Davis     88.7 ⭐   │  │                                      ││
│  │ 4. John Smith      85.3 ⭐   │  │ 2. Sarah Chen      "Mentored 5 new   ││
│  │ 5. Lisa Wang       82.1 ⭐   │  │    members in onboarding"            ││
│  │                              │  │                       [Copy for Post]││
│  └──────────────────────────────┘  └──────────────────────────────────────┘│
│                                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────────┐│
│  │ 📊 TRENDING TOPICS           │  │ 💡 AI RECOMMENDATIONS                ││
│  │ ───────────────────────────  │  │ ──────────────────────────────────── ││
│  │ #AI-tools      ████████ 156  │  │ • 15 members inactive 30+ days       ││
│  │ #hiring        █████ 89      │  │   → Send re-engagement email         ││
│  │ #remote-work   ████ 67       │  │                                      ││
│  │ #funding       ███ 45        │  │ • Topic "AI" trending - consider     ││
│  │ #product       ██ 34         │  │   → Host AI-focused workshop         ││
│  └──────────────────────────────┘  └──────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 5.7.2 Engagement Scoring

**Purpose**: Calculate and display member engagement scores.

**Scoring Formula**:
```
Engagement Score =
  (message_count × 1) +
  (reaction_count × 0.5) +
  (meeting_minutes × 0.5) +
  (event_checkins × 5) +
  (support_given × 3) +
  (consistency_bonus)

Normalized to 0-100 scale

Support Score =
  (supportive_messages × 2) +
  (answers_given × 3) +
  (resources_shared × 2) +
  (mentoring_interactions × 5)

Normalized to 0-100 scale
```

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| SCR-001 | Calculate engagement score daily | P0 |
| SCR-002 | Store score history for trends | P1 |
| SCR-003 | Show score breakdown on profile | P1 |
| SCR-004 | Configurable scoring weights | P2 |

#### 5.7.3 Recognition System

**Purpose**: Generate copy-paste ready recognition posts.

**Generated Text Example**:
```
🌟 Community Spotlight 🌟

Huge shoutout to our most supportive members this month!

1. Mike Johnson - Helped 23 members with their questions and shared
   invaluable resources on AI tools

2. Sarah Chen - Mentored 5 new members through onboarding and hosted
   2 community calls

3. Emily Davis - Consistently uplifts others with encouragement and
   connected 8 members for collaboration

Thank you for making our community amazing! 🙏
```

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| REC-001 | Generate recognition text with AI | P1 |
| REC-002 | One-click copy to clipboard | P0 |
| REC-003 | Customize recognition template | P2 |
| REC-004 | Track who has been recognized | P2 |

#### 5.7.4 AI Recommendations

**Purpose**: AI-generated suggestions for community growth.

**Recommendation Types**:
1. **Re-engagement**: Members who've gone quiet
2. **Connection**: Members with shared interests to connect
3. **Content**: Topics to create content about
4. **Events**: Event ideas based on interest trends
5. **Growth**: Actions to expand community

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| AIR-001 | Generate weekly recommendations | P1 |
| AIR-002 | Show on dashboard | P0 |
| AIR-003 | Dismiss recommendations | P1 |
| AIR-004 | Mark as actioned | P2 |

---

## 6. API Design

### 6.1 API Standards

**Base URL**: `https://app.example.com/api`

**Authentication**: Bearer token (Supabase JWT)
```
Authorization: Bearer <supabase_access_token>
```

**Response Format**:
```json
{
  "data": { ... },
  "error": null,
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 25
  }
}
```

**Error Format**:
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { "field": "email" }
  }
}
```

### 6.2 API Endpoints

#### Members API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | List members (paginated) |
| POST | `/api/members` | Create member |
| GET | `/api/members/:id` | Get member by ID |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |
| GET | `/api/members/:id/activities` | Get member activities |
| GET | `/api/members/search?q=` | Search members |
| GET | `/api/members/leaderboard` | Get top members |
| POST | `/api/members/import` | Import from CSV |

**GET /api/members**
```typescript
// Query params
interface MembersQuery {
  page?: number;        // Default: 1
  limit?: number;       // Default: 25, max: 100
  sort?: 'name' | 'engagement_score' | 'created_at';
  order?: 'asc' | 'desc';
  city?: string;
  min_score?: number;
  max_score?: number;
  is_active?: boolean;
}

// Response
interface MembersResponse {
  data: Member[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### Events API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events |
| POST | `/api/events` | Create event |
| GET | `/api/events/:id` | Get event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| GET | `/api/events/:id/qr` | Get QR code image |
| POST | `/api/events/:id/checkin` | Check in member |
| GET | `/api/events/:id/attendees` | Get attendees |

**POST /api/events/:id/checkin**
```typescript
// Request
interface CheckinRequest {
  member_id: string;
}

// Response
interface CheckinResponse {
  data: {
    checkin_id: string;
    event_id: string;
    member_id: string;
    checked_in_at: string;
  };
}
```

#### Meetings API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings` | List meetings |
| POST | `/api/meetings` | Create meeting record |
| POST | `/api/meetings/upload` | Upload recording |
| GET | `/api/meetings/:id` | Get meeting |
| DELETE | `/api/meetings/:id` | Delete meeting |
| POST | `/api/meetings/:id/transcribe` | Trigger transcription |
| GET | `/api/meetings/:id/transcript` | Get transcript |
| GET | `/api/meetings/:id/participants` | Get participants |
| PUT | `/api/meetings/:id/participants/:pid` | Update participant mapping |

**POST /api/meetings/upload**
```typescript
// Request: multipart/form-data
// - file: audio/video file
// - title: string
// - meeting_date: ISO datetime

// Response
interface UploadResponse {
  data: {
    meeting_id: string;
    file_url: string;
    status: 'pending';
  };
}
```

#### Integrations API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slack/oauth` | Initiate Slack OAuth |
| GET | `/api/slack/callback` | OAuth callback |
| GET | `/api/slack/channels` | List Slack channels |
| PUT | `/api/slack/channels/:id` | Connect/disconnect channel |
| POST | `/api/slack/events` | Slack event webhook |
| POST | `/api/whatsapp/webhook` | Twilio webhook |

#### Identity API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/identity/pending` | List pending matches |
| PUT | `/api/identity/:id` | Approve/reject match |
| POST | `/api/identity/match` | Trigger matching job |

**PUT /api/identity/:id**
```typescript
// Request
interface MatchDecisionRequest {
  action: 'approve' | 'reject';
  member_id?: string;  // If selecting different member
}
```

#### Analytics API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/engagement` | Get engagement stats |
| GET | `/api/analytics/topics` | Get trending topics |
| GET | `/api/analytics/support` | Get supportive members |
| GET | `/api/analytics/recommendations` | Get AI recommendations |
| POST | `/api/analytics/calculate` | Trigger score recalculation |

---

## 7. AI Integration

### 7.1 OpenAI Whisper (Transcription)

**Purpose**: Transcribe meeting recordings with speaker diarization.

**Model**: `whisper-1` or `gpt-4o-audio-preview` (for diarization)

**Implementation**:
```typescript
// lib/ai/transcription.ts
import OpenAI from 'openai';

const openai = new OpenAI();

export async function transcribeMeeting(
  audioUrl: string
): Promise<TranscriptionResult> {
  // Download audio from Supabase Storage
  const audioBuffer = await downloadFile(audioUrl);

  // Transcribe with Whisper
  const transcription = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment', 'word'],
  });

  return {
    text: transcription.text,
    segments: transcription.segments,
    duration: transcription.duration,
  };
}
```

**Speaker Diarization**:
For speaker identification, use a secondary service or model:
- **Option A**: pyannote.audio (open source, self-hosted)
- **Option B**: AssemblyAI (managed service)
- **Option C**: AWS Transcribe (managed service)

**Cost Estimate**: ~$0.006 per minute of audio

### 7.2 Claude API (Analysis)

**Purpose**: Sentiment analysis, topic extraction, support detection, recommendations.

**Model**: `claude-3-haiku-20240307` (fast/cheap) or `claude-3-5-sonnet-20241022` (quality)

#### 7.2.1 Sentiment Analysis

```typescript
// lib/ai/sentiment.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function analyzeSentiment(
  text: string
): Promise<SentimentResult> {
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `Analyze the sentiment of this community message.

Message: "${text}"

Return JSON:
{
  "score": <-1.0 to 1.0>,
  "label": "positive" | "neutral" | "negative",
  "is_supportive": <true if encouraging/helpful>
}

JSON only:`
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

#### 7.2.2 Topic Extraction

```typescript
// lib/ai/topics.ts
export async function extractTopics(
  messages: string[]
): Promise<TopicResult[]> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Extract main discussion topics from these community messages.

Messages:
${messages.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Return JSON array:
[
  {
    "name": "topic name",
    "count": <number of messages about this>,
    "keywords": ["keyword1", "keyword2"]
  }
]

JSON only:`
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

#### 7.2.3 Recommendations Generation

```typescript
// lib/ai/recommendations.ts
export async function generateRecommendations(
  context: CommunityContext
): Promise<Recommendation[]> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are a community growth advisor. Based on the following community data, generate actionable recommendations.

Community Stats:
- Total members: ${context.totalMembers}
- Active this month: ${context.activeMembers}
- Inactive 30+ days: ${context.inactiveMembers}
- Trending topics: ${context.trendingTopics.join(', ')}
- Recent events: ${context.recentEvents}

Generate 3-5 specific, actionable recommendations in JSON:
[
  {
    "type": "re_engagement" | "content" | "event" | "connection" | "growth",
    "title": "short title",
    "description": "detailed description",
    "priority": 1-10,
    "action_data": { ... }
  }
]

JSON only:`
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

### 7.3 Identity Matching

**Purpose**: Match platform identities to members.

```typescript
// lib/ai/matching.ts

export async function findBestMatch(
  identity: PlatformIdentity,
  members: Member[]
): Promise<MatchResult> {
  const candidates: MatchCandidate[] = [];

  for (const member of members) {
    const signals = {
      // Email exact match (if available)
      emailMatch: identity.email &&
        identity.email.toLowerCase() === member.email?.toLowerCase()
        ? 1.0 : 0,

      // Name similarity (Levenshtein)
      nameSimilarity: calculateNameSimilarity(
        identity.platform_display_name,
        `${member.first_name} ${member.last_name}`
      ),

      // Username contains email prefix
      usernameEmailMatch: identity.platform_username?.includes(
        member.email?.split('@')[0] || ''
      ) ? 0.8 : 0,
    };

    // Weighted score
    const confidence =
      signals.emailMatch * 0.5 +
      signals.nameSimilarity * 0.35 +
      signals.usernameEmailMatch * 0.15;

    if (confidence > 0.4) {
      candidates.push({
        memberId: member.id,
        confidence,
        reasons: signals,
      });
    }
  }

  // Sort by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);

  return candidates[0] || null;
}

function calculateNameSimilarity(a: string, b: string): number {
  // Levenshtein distance normalized to 0-1
  const distance = levenshtein(a.toLowerCase(), b.toLowerCase());
  const maxLen = Math.max(a.length, b.length);
  return 1 - (distance / maxLen);
}
```

### 7.4 AI Cost Estimates

| Operation | Model | Est. Cost | Volume |
|-----------|-------|-----------|--------|
| Transcription | Whisper | $0.006/min | ~10 hrs/mo = $3.60 |
| Sentiment | Claude Haiku | $0.00025/msg | ~5000/mo = $1.25 |
| Topics | Claude Sonnet | $0.003/call | ~100/mo = $0.30 |
| Recommendations | Claude Sonnet | $0.015/call | ~10/mo = $0.15 |
| **Total** | | | **~$5-10/month** |

---

## 8. Third-Party Integrations

### 8.1 Slack Integration

#### 8.1.1 App Configuration

**Slack App Settings**:
```yaml
App Name: Community Engagement Bot
Bot Token Scopes:
  - channels:history
  - channels:read
  - reactions:read
  - users:read
  - users:read.email

Event Subscriptions:
  - message.channels
  - reaction_added

OAuth Redirect URL: https://app.example.com/api/slack/callback
```

#### 8.1.2 OAuth Flow

```typescript
// app/api/slack/oauth/route.ts
export async function GET() {
  const slackAuthUrl = new URL('https://slack.com/oauth/v2/authorize');
  slackAuthUrl.searchParams.set('client_id', process.env.SLACK_CLIENT_ID!);
  slackAuthUrl.searchParams.set('scope', 'channels:history,channels:read,users:read,users:read.email');
  slackAuthUrl.searchParams.set('redirect_uri', `${process.env.APP_URL}/api/slack/callback`);

  return NextResponse.redirect(slackAuthUrl);
}

// app/api/slack/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  // Exchange code for token
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code: code!,
    }),
  });

  const data = await response.json();

  // Store token securely
  await storeSlackCredentials(data.access_token, data.team);

  return NextResponse.redirect('/dashboard/integrations/slack?success=true');
}
```

#### 8.1.3 Event Handling

```typescript
// app/api/slack/events/route.ts
import { verifySlackSignature } from '@/lib/integrations/slack';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-slack-signature')!;
  const timestamp = request.headers.get('x-slack-request-timestamp')!;

  // Verify request is from Slack
  if (!verifySlackSignature(body, signature, timestamp)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Handle URL verification challenge
  if (event.type === 'url_verification') {
    return NextResponse.json({ challenge: event.challenge });
  }

  // Handle message events
  if (event.event?.type === 'message' && !event.event.bot_id) {
    await processSlackMessage(event.event);
  }

  return NextResponse.json({ ok: true });
}
```

### 8.2 Twilio WhatsApp Integration

#### 8.2.1 Webhook Configuration

**Twilio Console Settings**:
```
Webhook URL: https://app.example.com/api/whatsapp/webhook
HTTP Method: POST
```

#### 8.2.2 Message Handler

```typescript
// app/api/whatsapp/webhook/route.ts
import twilio from 'twilio';

export async function POST(request: Request) {
  const formData = await request.formData();

  // Verify Twilio signature
  const signature = request.headers.get('x-twilio-signature')!;
  const url = `${process.env.APP_URL}/api/whatsapp/webhook`;

  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    Object.fromEntries(formData)
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const message = {
    from: formData.get('From') as string,      // whatsapp:+1234567890
    body: formData.get('Body') as string,
    timestamp: new Date(),
  };

  // Process message
  await processWhatsAppMessage(message);

  return new Response('', { status: 200 });
}
```

### 8.3 QR Code Generation

```typescript
// lib/qr.ts
import QRCode from 'qrcode';

export async function generateEventQR(
  eventId: string
): Promise<string> {
  const checkInUrl = `${process.env.APP_URL}/checkin/${eventId}`;

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  return qrDataUrl;
}
```

### 8.4 Background Jobs (Inngest)

```typescript
// inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({ id: 'community-platform' });

// inngest/functions/transcribe-meeting.ts
export const transcribeMeeting = inngest.createFunction(
  { id: 'transcribe-meeting' },
  { event: 'meeting/uploaded' },
  async ({ event, step }) => {
    const { meetingId, fileUrl } = event.data;

    // Step 1: Download file
    const audioBuffer = await step.run('download-file', async () => {
      return downloadFromStorage(fileUrl);
    });

    // Step 2: Transcribe with Whisper
    const transcript = await step.run('transcribe', async () => {
      return transcribeWithWhisper(audioBuffer);
    });

    // Step 3: Run speaker diarization
    const segments = await step.run('diarize', async () => {
      return diarizeSpeakers(audioBuffer, transcript);
    });

    // Step 4: Store results
    await step.run('store-results', async () => {
      return storeTranscript(meetingId, segments);
    });

    // Step 5: Analyze with AI
    await step.run('analyze', async () => {
      return analyzeTranscript(meetingId, segments);
    });

    return { success: true, meetingId };
  }
);
```

---

## 9. Security & Authentication

### 9.1 Authentication Flow

**Method**: Supabase Auth with Magic Link

```typescript
// lib/supabase/auth.ts
import { createClient } from '@/lib/supabase/client';

export async function signInWithEmail(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}

// app/auth/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect('/dashboard');
}
```

### 9.2 Authorization

**Role-Based Access**:
- **Admin**: Full access to all features
- **Member**: View-only access to public data

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Admin-only routes
  if (request.nextUrl.pathname.startsWith('/dashboard/settings')) {
    const { data: member } = await supabase
      .from('members')
      .select('is_admin')
      .eq('id', session?.user.id)
      .single();

    if (!member?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}
```

### 9.3 API Security

**Rate Limiting**:
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    throw new RateLimitError(limit, reset);
  }

  return { limit, remaining, reset };
}
```

**Webhook Verification**:
- Slack: Verify `x-slack-signature` header
- Twilio: Verify `x-twilio-signature` header

### 9.4 Data Protection

**Sensitive Data Handling**:
- API keys stored in environment variables
- Integration tokens encrypted at rest
- PII (phone numbers, emails) protected by RLS
- Audit logging for admin actions

**GDPR Considerations**:
- Member data export capability
- Data deletion on request
- Consent tracking for communications

---

## 10. User Interface Design

### 10.1 Design System

**Component Library**: shadcn/ui (Tailwind-based)

**Color Palette**:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
}
```

**Typography**:
- Font: Inter (sans-serif)
- Headings: 600 weight
- Body: 400 weight

### 10.2 Key Screens

#### Login Page
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Community Platform                         │
│                                                                 │
│              ┌─────────────────────────────────┐                │
│              │                                 │                │
│              │    Sign in with Email           │                │
│              │                                 │                │
│              │    ┌───────────────────────┐    │                │
│              │    │ your@email.com        │    │                │
│              │    └───────────────────────┘    │                │
│              │                                 │                │
│              │    [  Send Magic Link  ]        │                │
│              │                                 │                │
│              └─────────────────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ ☰ Community Platform                              👤 Admin ▼   │
├───────────────┬─────────────────────────────────────────────────┤
│               │                                                 │
│  Dashboard    │   [Dashboard Content Area]                      │
│  Members      │                                                 │
│  Events       │                                                 │
│  Meetings     │                                                 │
│  Analytics    │                                                 │
│               │                                                 │
│  ─────────    │                                                 │
│  Integrations │                                                 │
│  Identity     │                                                 │
│  Settings     │                                                 │
│               │                                                 │
└───────────────┴─────────────────────────────────────────────────┘
```

### 10.3 Responsive Design

**Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Considerations**:
- Collapsible sidebar (hamburger menu)
- Stack cards vertically
- Touch-friendly buttons (min 44px)
- QR scanner optimized for mobile

---

## 11. Deployment & Infrastructure

### 11.1 Vercel Configuration

**vercel.json**:
```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/meetings/upload/route.ts": {
      "maxDuration": 60
    },
    "app/api/ai/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/calculate-scores",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/generate-recommendations",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

### 11.2 Environment Variables

```bash
# .env.local

# App
NEXT_PUBLIC_APP_URL=https://app.example.com
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Slack
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Upstash (Rate Limiting)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### 11.3 Supabase Configuration

**Storage Buckets**:
- `recordings`: Meeting recordings (private)
- `avatars`: Member avatars (public)

**Edge Functions** (if needed):
- Complex database operations
- Scheduled tasks

### 11.4 Monitoring

**Services**:
- **Vercel Analytics**: Traffic & performance
- **Sentry**: Error tracking
- **Inngest Dashboard**: Job monitoring

---

## 12. Cost Estimates

### 12.1 Monthly Infrastructure Costs

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Vercel | Pro | $20 | Team features, analytics |
| Supabase | Pro | $25 | 8GB database, 100GB storage |
| Upstash Redis | Pay-as-you-go | ~$5 | Rate limiting |
| **Subtotal** | | **$50** | |

### 12.2 AI Service Costs

| Service | Usage | Cost | Notes |
|---------|-------|------|-------|
| OpenAI Whisper | ~10 hrs audio/mo | $3.60 | $0.006/min |
| Claude Haiku | ~5000 messages/mo | $1.25 | Sentiment analysis |
| Claude Sonnet | ~200 requests/mo | $0.60 | Topics, recommendations |
| **Subtotal** | | **~$5-10** | Variable |

### 12.3 Integration Costs

| Service | Cost | Notes |
|---------|------|-------|
| Slack | $0 | Free API access |
| Twilio WhatsApp | ~$10-50 | $0.005-0.05/message |
| **Subtotal** | **$10-50** | Variable |

### 12.4 Total Monthly Estimate

| Category | Min | Max |
|----------|-----|-----|
| Infrastructure | $50 | $50 |
| AI Services | $5 | $15 |
| Integrations | $10 | $50 |
| **Total** | **$65** | **$115** |

---

## 13. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup (Next.js, Supabase, Tailwind)
- [ ] Database schema creation
- [ ] Authentication implementation
- [ ] Basic member CRUD
- [ ] CSV import functionality
- [ ] Member search/filter

### Phase 2: Event Check-in (Weeks 3-4)
- [ ] Event management UI
- [ ] QR code generation
- [ ] Public check-in page
- [ ] Mobile QR scanner
- [ ] Attendance tracking

### Phase 3: Meeting Processing (Weeks 5-7)
- [ ] File upload to Supabase Storage
- [ ] Inngest job queue setup
- [ ] Whisper API integration
- [ ] Transcript storage
- [ ] Speaker mapping UI
- [ ] Meeting analytics

### Phase 4: Slack Integration (Weeks 8-9)
- [ ] Slack app configuration
- [ ] OAuth flow
- [ ] Channel selection
- [ ] Message sync
- [ ] User mapping

### Phase 5: WhatsApp Integration (Weeks 10-11)
- [ ] Twilio webhook setup
- [ ] Message ingestion
- [ ] Phone-to-member mapping
- [ ] Message analysis

### Phase 6: Identity Reconciliation (Week 12)
- [ ] Matching algorithm
- [ ] Admin review UI
- [ ] Bulk operations

### Phase 7: Analytics & AI (Weeks 13-14)
- [ ] Engagement scoring
- [ ] Dashboard widgets
- [ ] Leaderboards
- [ ] Recognition generator
- [ ] AI recommendations

### Phase 8: Polish & Launch (Weeks 15-16)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Documentation
- [ ] User testing
- [ ] Production deployment

---

## 14. Appendix

### 14.1 Glossary

| Term | Definition |
|------|------------|
| Engagement Score | Numeric representation (0-100) of member participation |
| Support Score | Numeric representation (0-100) of helpful interactions |
| Platform Identity | A member's identity on an external platform (Slack, WhatsApp) |
| Diarization | Process of identifying who spoke when in an audio recording |
| RLS | Row Level Security - database-level access control |

### 14.2 References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Slack API](https://api.slack.com/)
- [Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Inngest Documentation](https://www.inngest.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### 14.3 Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-08 | Initial specification |

---

*Document prepared for AI Community Platform development*
