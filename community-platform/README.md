# AI Community Engagement Platform

A comprehensive AI-powered platform to track and analyze community engagement across multiple communication channels.

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
2. Run the database schema creation script (see `supabase/schema.sql`)
3. Copy your project URL and keys to `.env.local`

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
- [ ] Database schema creation
- [ ] Authentication implementation
- [ ] Basic member CRUD
- [ ] CSV import functionality
- [ ] Member search/filter

## License

Private project - All rights reserved
