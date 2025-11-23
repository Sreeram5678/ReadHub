# Book Reading Tracker

A Next.js application for tracking daily book reading progress and competing with friends on a leaderboard.

## Features

- **OAuth Authentication**: Sign in with Google or GitHub
- **Book Management**: Add, edit, and delete books you're reading
- **Daily Reading Logs**: Track pages read per book each day
- **Leaderboard**: Compete with friends and see rankings (all-time, today, this week, this month)
- **Dashboard**: View your reading statistics and recent activity

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

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

3. Create `.env.local` file and add your OAuth credentials:
   - For Google OAuth: Go to [Google Cloud Console](https://console.cloud.google.com/) and create OAuth 2.0 credentials
   - For GitHub OAuth: Go to [GitHub Developer Settings](https://github.com/settings/developers) and create a new OAuth App
   - Generate a secret for `NEXTAUTH_SECRET`:
     ```bash
     openssl rand -base64 32
     ```

5. Set up the database:
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

1. **Sign In**: Click "Get Started" and sign in with Google or GitHub
2. **Add Books**: Go to "My Books" and add books you're reading
3. **Log Reading**: Use the "Log Reading" button on the dashboard to record pages read
4. **View Leaderboard**: Check the leaderboard to see how you rank against other users
5. **Track Progress**: View your reading statistics on the dashboard

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
- **ReadingLog**: Daily reading entries

## Development

- Run migrations: `npx prisma migrate dev`
- View database: `npx prisma studio`
- Generate Prisma client: `npx prisma generate`

## License

MIT
