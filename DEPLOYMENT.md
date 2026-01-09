# Deployment Guide
## AI Community Engagement Platform

This guide will walk you through deploying the AI Community Engagement Platform from scratch.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Environment Variables](#environment-variables)
4. [Local Development](#local-development)
5. [Deploying to Vercel](#deploying-to-vercel)
6. [Integration Setup](#integration-setup)
7. [Post-Deployment Tasks](#post-deployment-tasks)

---

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier is fine)
- A Vercel account (free tier is fine)
- An Anthropic API key for Claude (for AI features)
- Optional: Slack workspace with admin access
- Optional: Twilio account for WhatsApp integration

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - **Name**: `community-platform` (or your preferred name)
   - **Database Password**: Choose a strong password and save it
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is fine to start
6. Click "Create new project" and wait for it to initialize (~2 minutes)

### Step 2: Run the Database Schema

1. Once your project is ready, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Open the file `community-platform/supabase/schema.sql` from this repository
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run" to execute the schema

This will create all necessary tables, indexes, functions, and row-level security policies.

### Step 3: Get Your Supabase Credentials

1. Go to "Project Settings" (gear icon in left sidebar)
2. Click on "API" in the left menu
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secure!)

---

## Environment Variables

### Step 1: Create Local Environment File

1. Navigate to the `community-platform` directory
2. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

### Step 2: Fill in Required Variables

Edit `.env.local` with your values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Anthropic API (for AI features)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Twilio (for WhatsApp - optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=+1234567890

# Slack (optional)
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
```

### Getting an Anthropic API Key

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to "API Keys"
4. Click "Create Key"
5. Copy the key and add it to your `.env.local`

---

## Local Development

### Step 1: Install Dependencies

```bash
cd community-platform
npm install
```

### Step 2: Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Step 3: Create Your First Admin User

1. Navigate to `http://localhost:3000/register`
2. Create an account with your email
3. Go to your Supabase project → "Table Editor" → "members"
4. Find your newly created member record
5. Edit the record and set `is_admin` to `true`
6. Save the changes

You now have admin access to the platform!

---

## Deploying to Vercel

### Step 1: Push Code to GitHub

Your code is already on GitHub at: `https://github.com/chrisxdn-bot/TE-Community-AI`

### Step 2: Connect to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `chrisxdn-bot/TE-Community-AI`
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `community-platform`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables in Vercel

In the Vercel project settings, add all the environment variables from your `.env.local`:

1. Click on "Settings" → "Environment Variables"
2. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (use your Vercel URL: `https://your-project.vercel.app`)
   - `ANTHROPIC_API_KEY`
   - `TWILIO_ACCOUNT_SID` (if using WhatsApp)
   - `TWILIO_AUTH_TOKEN` (if using WhatsApp)
   - `TWILIO_WHATSAPP_NUMBER` (if using WhatsApp)
   - `SLACK_BOT_TOKEN` (if using Slack)
   - `SLACK_SIGNING_SECRET` (if using Slack)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the deployment to complete (~2-3 minutes)
3. Visit your deployed application at the provided URL

---

## Integration Setup

### Slack Integration (Optional)

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "Community Engagement Bot")
4. Select your workspace
5. Go to "OAuth & Permissions"
6. Add the following Bot Token Scopes:
   - `channels:history`
   - `channels:read`
   - `users:read`
   - `chat:write`
7. Install the app to your workspace
8. Copy the "Bot User OAuth Token" → `SLACK_BOT_TOKEN`
9. Go to "Event Subscriptions"
10. Enable events
11. Set Request URL: `https://your-app.vercel.app/api/webhooks/slack`
12. Subscribe to bot events:
    - `message.channels`
    - `reaction_added`
13. Save changes

### WhatsApp Integration via Twilio (Optional)

1. Go to [https://www.twilio.com/console](https://www.twilio.com/console)
2. Sign up or log in
3. Go to "Messaging" → "Try it out" → "Try WhatsApp"
4. Follow the setup wizard to get a WhatsApp-enabled number
5. Note your:
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`
   - WhatsApp number → `TWILIO_WHATSAPP_NUMBER`
6. Configure webhook:
   - Go to "Messaging" → "Settings" → "WhatsApp sandbox settings"
   - Set "When a message comes in": `https://your-app.vercel.app/api/webhooks/whatsapp`
   - Method: POST
7. Save settings

---

## Post-Deployment Tasks

### 1. Create Members

Navigate to `/members` and either:
- Click "Add Member" to add members individually
- Click "Import CSV" to bulk import members

CSV format:
```csv
first_name,last_name,email,phone,current_city,linkedin_url,years_with_te,bio
John,Doe,john@example.com,+1234567890,New York,https://linkedin.com/in/johndoe,2,Software engineer
```

### 2. Create Your First Event

1. Go to `/events`
2. Click "Create Event"
3. Fill in event details
4. The system will auto-generate a QR code
5. Download the QR code and display it at your event
6. Members can scan to check in

### 3. Set Up Monitoring

- Monitor your Vercel deployment logs for errors
- Check Supabase logs for database queries
- Review API usage in Anthropic console

### 4. Optional: Custom Domain

1. In Vercel, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## Troubleshooting

### Database Connection Issues

- Verify Supabase credentials are correct
- Check that RLS policies are enabled
- Ensure your IP isn't blocked in Supabase

### Build Failures

- Check all environment variables are set in Vercel
- Ensure Node.js version is 18 or higher
- Review build logs for specific errors

### Webhook Issues

- Verify webhook URLs are accessible publicly
- Check that environment variables for integrations are set
- Review API logs in integration platforms (Slack, Twilio)

### AI Features Not Working

- Confirm `ANTHROPIC_API_KEY` is set correctly
- Check API key has sufficient credits
- Review rate limits in Anthropic console

---

## Next Steps

1. **Customize branding**: Update colors, logos, and text in the codebase
2. **Add more integrations**: Extend with Zoom API, email tracking, etc.
3. **Enable AI analysis**: Set up cron jobs to analyze messages and generate insights
4. **Create dashboards**: Build custom analytics views for your community

---

## Support

For issues or questions:
- Check the [SPEC.md](SPEC.md) for detailed feature documentation
- Review code comments for implementation details
- Open an issue on GitHub: [https://github.com/chrisxdn-bot/TE-Community-AI/issues](https://github.com/chrisxdn-bot/TE-Community-AI/issues)

---

## Security Notes

- Never commit `.env.local` to version control
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret - it has admin access
- Regularly rotate API keys and tokens
- Enable 2FA on all services (Supabase, Vercel, GitHub)
- Review and audit RLS policies regularly
