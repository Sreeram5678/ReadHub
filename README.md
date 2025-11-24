# Book Reading Tracker

A Next.js application for tracking daily book reading progress and competing with friends on a leaderboard.

## Features

### Core Features
- **OAuth Authentication**: Sign in with Google or GitHub
- **Book Management**: Add, edit, and delete books you're reading
- **Daily Reading Logs**: Track pages read per book each day
- **Book Completion**: Mark books as completed with visual indicators
- **Leaderboard**: Compete with friends and see rankings (all-time, today, this week, this month)
- **Enhanced Dashboard**: Comprehensive reading statistics and insights

### Reading Analytics & Goals
- **Reading Streaks**: Track consecutive days of reading with streak counter
- **Reading Goals**: Set and track daily, weekly, or monthly reading targets
  - Create custom reading goals
  - Edit goals to adjust targets
  - Delete goals when no longer needed
  - Visual progress bars showing goal completion
- **Reading Trends Chart**: Visualize your reading activity over the last 30 days
- **Reading Statistics**: 
  - Total pages read (all-time)
  - Today's reading progress
  - Weekly and monthly reading summaries
  - Days active this week/month
  - Completed books count

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM (SQLite for local development)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd book-reading-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file and add your environment variables:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/booktracker?schema=public"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```
   
   - For Google OAuth: Go to [Google Cloud Console](https://console.cloud.google.com/) and create OAuth 2.0 credentials
   - For GitHub OAuth: Go to [GitHub Developer Settings](https://github.com/settings/developers) and create a new OAuth App
   - Generate a secret for `NEXTAUTH_SECRET`:
     ```bash
     openssl rand -base64 32
     ```
   - For local development with PostgreSQL, install PostgreSQL locally or use a cloud database. Alternatively, you can temporarily change the Prisma schema to use SQLite for local testing.

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Getting Started
1. **Sign In**: Click "Get Started" and sign in with Google or GitHub
2. **Add Books**: Go to "My Books" and add books you're reading
   - Set total pages and initial pages (if you've already started reading)
3. **Log Reading**: Use the "Log Reading" button on the dashboard to record pages read each day
4. **Mark Books Complete**: Click the checkmark icon on any book to mark it as completed

### Tracking Your Progress
- **View Dashboard**: See your reading streak, total pages, and daily/weekly/monthly stats
- **Set Reading Goals**: Create daily, weekly, or monthly reading targets
  - Click "Add Goal" on the dashboard
  - Choose your period and set a target number of pages
  - Edit or delete goals anytime using the action buttons
- **View Trends**: Check the reading trends chart to see your reading patterns over time
- **Check Leaderboard**: See how you rank against other users (all-time, today, this week, this month)

## Project Structure

```
book-reading-tracker/
├── app/
│   ├── api/              # API routes
│   ├── (auth)/          # Public auth pages
│   ├── (protected)/     # Protected pages
│   └── page.tsx         # Landing page
├── components/          # React components
├── lib/                 # Utility functions and configurations
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

## Database Schema

- **User**: OAuth user information
- **Book**: Books being tracked by users
  - Includes status (reading/completed) and completion date
  - Tracks initial pages and current progress
- **ReadingLog**: Daily reading entries
- **ReadingGoal**: User-defined reading goals (daily/weekly/monthly targets)

## Development

- Run migrations: `npx prisma migrate dev`
- View database: `npx prisma studio`
- Generate Prisma client: `npx prisma generate`

## Deployment

This app is configured for deployment on **Vercel** with **Supabase** (PostgreSQL database).

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step deployment instructions.

### Quick Deploy

1. Push your code to GitHub
2. Create a Supabase project and get your database URL
3. Deploy to Vercel and add environment variables
4. Update OAuth callback URLs

## License

MIT
