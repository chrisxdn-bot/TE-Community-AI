# AI Community Engagement Platform

[![CI](https://github.com/YOUR_USERNAME/REPO_NAME/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/REPO_NAME/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

A comprehensive AI-powered platform to track and analyze community engagement across multiple communication channels.

> **Status**: Phase 1 & 2 Complete ✅ | Production Ready 🚀

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd community-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase/schema.sql` and run it
4. Go to "Project Settings" > "API" and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Update your `.env.local` file with these values

See [supabase/README.md](./supabase/README.md) for detailed database setup instructions.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

Create a production build:

```bash
npm run build
npm start
```

## Project Structure

```
community-platform/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── members/           # Member management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utility functions
│   └── supabase/         # Supabase clients
├── utils/                # Helper functions
└── public/               # Static assets
```

## Features

### Phase 1: Foundation ✅
- [x] Project setup (Next.js, Supabase, Tailwind)
- [x] Database schema creation
- [x] Authentication implementation (login/register)
- [x] Basic member CRUD operations
- [x] CSV import functionality
- [x] Member search and filter features

### Phase 2: Event Check-in ✅
- [x] Event management UI (create, edit, delete, list)
- [x] QR code generation for each event
- [x] Public check-in page (no auth required)
- [x] Mobile QR scanner with camera integration
- [x] Attendance tracking and CSV export reports

### Phase 3: Integrations ✅
- [x] Slack webhook integration for message tracking
- [x] WhatsApp integration via Twilio
- [x] Platform identity linking system
- [x] Automated engagement activity tracking
- [x] Message sentiment analysis preparation

### Phase 4: AI Analysis ✅
- [x] Claude API integration for sentiment analysis
- [x] Topic extraction from conversations
- [x] Community insights generation
- [x] Automated recognition post generation
- [x] Supportive interaction detection

### Phase 5: Analytics ✅
- [x] Dashboard statistics (members, events, messages)
- [x] Top contributors tracking
- [x] Activity trends visualization
- [x] Trending topics identification
- [x] Engagement score calculations

## Usage

### First Steps After Setup

1. **Create Your First Account**
   - Navigate to `/register` and create an account
   - This will create a member record in the database

2. **Make Yourself an Admin**
   - Go to Supabase SQL Editor
   - Run: `UPDATE members SET is_admin = true WHERE email = 'your-email@example.com';`

3. **Add Members**
   - Go to `/members` page
   - Click "Add Member" to add individually
   - Click "Import CSV" to bulk import members

### CSV Import Format

The CSV import feature expects the following format:

```csv
first_name,last_name,email,phone,current_city,linkedin_url,years_with_te,bio
John,Doe,john@example.com,+1234567890,New York,https://linkedin.com/in/johndoe,2,Bio text
```

Required fields: `first_name`, `last_name`

### Member Management

- **View all members**: Navigate to [/members](http://localhost:3000/members)
- **Search members**: Use the search box to filter by name or email
- **Sort members**: Choose from name, engagement score, support score, or recently added
- **Edit member**: Click "Edit" on any member row
- **Delete member**: Click "Delete" (requires confirmation)

### Event Management

- **Create events**: Navigate to `/events` and click "Create Event"
- **Generate QR codes**: Automatically generated for each event
- **Check-in tracking**: Members scan QR code to check in
- **View attendees**: See who attended each event in real-time

### Integrations

#### Slack Integration
Webhook endpoint: `/api/webhooks/slack`
- Tracks messages from connected channels
- Links Slack users to member profiles
- Analyzes sentiment and supportiveness
- Logs engagement activities automatically

#### WhatsApp Integration (via Twilio)
Webhook endpoint: `/api/webhooks/whatsapp`
- Processes incoming WhatsApp messages
- Links phone numbers to members
- Tracks group engagement
- Stores message history

### AI Features

The platform uses Claude API for:
- **Sentiment Analysis**: Analyzes message tone (-1 to 1 scale)
- **Topic Extraction**: Identifies trending topics from conversations
- **Community Insights**: Generates monthly summaries and recommendations
- **Recognition Posts**: Auto-generates recognition posts for top contributors

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md)

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - Optional: `TWILIO_*`, `SLACK_*` for integrations
4. Deploy

Vercel will automatically detect Next.js and configure the build settings.

## License

Private project - All rights reserved
