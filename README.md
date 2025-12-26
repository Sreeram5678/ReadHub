# ReadHub

A comprehensive reading tracker and social platform for book lovers. Track your reading habits, compete with friends, join reading challenges, and build a personalized reading community. Features advanced analytics, social reading groups, customizable dashboards, and tools to deepen your reading experience.

## Features

### 📚 Book Management
- **Comprehensive Library**: Add, edit, organize, and track your entire book collection
- **Series Tracking**: Organize and track book series with automatic numbering
- **Priority-Based TBR**: Rank books on your "To Be Read" shelf by priority
- **Re-reading Support**: Track multiple reads of the same book with separate ratings and notes
- **DNF Tracking**: Record books you didn't finish with reasons
- **Book Lending**: Track books you've loaned to friends with due dates and notes

### 📖 Reading Experience
- **Reading Sessions**: Time your reading sessions with location tracking and GPS mapping
- **Speed Testing**: Measure and track your reading speed (words per minute)
- **Memory Palace**: Associate books with real-world locations and life events
- **Reading Journal**: Write personal reflections and thoughts about your reading
- **Chapter Notes**: Add detailed annotations and notes by chapter
- **Vocabulary Builder**: Save and track new words learned from your reading
- **Quote Collection**: Save and organize memorable quotes from your books

### 🎯 Goals & Analytics
- **Custom Reading Goals**: Set daily, weekly, monthly, or custom period targets
- **Advanced Dashboard**: Fully customizable widget-based dashboard with multiple presets
- **Reading Streaks**: Track consecutive reading days with visual streak counters
- **Reading Heatmap**: GitHub-style activity heatmap showing your reading consistency
- **Progress Analytics**: Charts and trends for reading pace, completion rates, and patterns
- **Multi-dimensional Ratings**: Rate books across plot, characters, writing style, and pacing
- **Achievement System**: Unlock milestones for reading streaks, books completed, and pages read

### 👥 Social Features
- **Friends & Leaderboards**: Connect with friends and compete on global or friend leaderboards
- **Reading Groups**: Create or join reading clubs with discussion and shared progress
- **Group Chat**: Real-time messaging within reading groups with reactions and attachments
- **Reading Challenges**: Join or create challenges (yearly goals, genre challenges, page counts, etc.)
- **Challenge Leaderboards**: Compete within challenges with progress tracking
- **Public Profiles**: Share your reading progress and achievements with the community

### 🛠️ Tools & Utilities
- **Reading Timer**: Built-in timer for focused reading sessions
- **Quick Logging**: Rapid entry of reading progress from anywhere in the app
- **Daily Quotes**: Inspirational reading quotes to motivate your habit
- **Reminders**: Customizable reading reminders with flexible scheduling
- **Reading Speed Calculator**: Test and track improvements in reading speed
- **Quick Stats**: Shareable reading statistics widgets

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19 with TypeScript
- **Authentication**: NextAuth.js v5 with OAuth (Google, GitHub) and email/password support
- **Database**: PostgreSQL with Prisma ORM (SQLite for local development)
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: shadcn/ui with Radix UI primitives
- **Charts & Visualization**: Recharts for data visualization, Leaflet for interactive maps
- **Animations**: Framer Motion for smooth interactions
- **Performance**: Vercel Speed Insights for monitoring
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Server Components with optimistic updates

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd readhub
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
1. **Sign Up/Login**: Create an account using email/password or OAuth (Google/GitHub)
2. **Build Your Library**: Add books to your collection with detailed metadata
3. **Customize Dashboard**: Choose from preset layouts or customize widgets to your preference
4. **Set Goals**: Define reading targets that match your lifestyle and ambitions

### Core Workflows

#### 📚 Library Management
- **Add Books**: Comprehensive book entry with author, page count, and series information
- **Organize Series**: Group books by series with automatic numbering
- **Prioritize TBR**: Rank upcoming reads by interest level
- **Track Multiple Reads**: Record separate experiences for re-reads

#### 📖 Reading Sessions
- **Start Sessions**: Use the reading timer to track focused reading time
- **Location Tracking**: GPS-enabled session logging with map visualization
- **Speed Testing**: Regular assessments to measure reading improvements
- **Journal Entries**: Record thoughts, feelings, and insights from your reading

#### 🎯 Goal Setting & Progress
- **Flexible Targets**: Set daily, weekly, monthly, or custom-period goals
- **Progress Visualization**: Charts showing goal completion and trends
- **Streak Tracking**: Maintain reading consistency with streak counters
- **Achievement Unlocks**: Celebrate milestones and reading accomplishments

#### 👥 Social Features
- **Connect with Friends**: Send friend requests and follow reading progress
- **Join Groups**: Participate in reading clubs with discussion and shared challenges
- **Create Challenges**: Design reading challenges for yourself or the community
- **Compete on Leaderboards**: See how you rank globally or among friends

### Advanced Features

#### 📝 Deep Reading Tools
- **Chapter Notes**: Detailed annotations organized by chapter
- **Vocabulary Building**: Save and review new words with context
- **Quote Collection**: Curate meaningful passages with page references
- **Memory Palace**: Associate books with real-world locations and life events

#### 📊 Analytics & Insights
- **Reading Heatmap**: Visualize your reading consistency over time
- **Trend Analysis**: Charts showing reading patterns and pace
- **Multi-dimensional Reviews**: Rate books across multiple criteria
- **Custom Dashboard**: Arrange widgets to focus on your priorities

#### 🔔 Smart Reminders
- **Flexible Scheduling**: Set reminders for specific times and days
- **Reading Streaks**: Get notified to maintain your reading momentum
- **Goal Deadlines**: Alerts for approaching target dates

### 🌟 Unique Features

#### Memory Palace Integration
Associate books with real-world locations and life events, creating a spatial memory system that makes your reading experiences unforgettable.

#### Multi-dimensional Book Reviews
Rate books across multiple criteria (plot, characters, writing style, pacing) for more nuanced book recommendations and analysis.

#### Social Reading Groups
Create or join reading clubs with real-time chat, shared challenges, and collaborative progress tracking.

#### Advanced Re-reading Support
Track multiple reads of the same book with separate ratings, notes, and completion dates.

#### GPS-Enabled Reading Sessions
Map your reading locations and see patterns in where you read best.

## Project Structure

```
readhub/
├── app/
│   ├── (auth)/              # Authentication pages (login, signup, forgot-password)
│   ├── (protected)/         # Protected user pages
│   │   ├── books/          # Book management pages
│   │   ├── challenges/     # Reading challenges
│   │   ├── dashboard/      # Main dashboard with widgets
│   │   ├── friends/        # Friend management
│   │   ├── groups/         # Reading groups and clubs
│   │   ├── leaderboard/    # Competitive rankings
│   │   ├── memory-palace/  # Location-based memory associations
│   │   ├── profile/        # User profiles
│   │   ├── reminders/      # Reading reminders
│   │   ├── series/         # Book series management
│   │   └── tbr/           # To Be Read shelf
│   ├── api/                # Next.js API routes
│   │   ├── achievements/  # Achievement system
│   │   ├── auth/          # Authentication endpoints
│   │   ├── book-loans/    # Book lending tracker
│   │   ├── book-memories/ # Memory Palace associations
│   │   ├── book-reads/    # Re-reading tracking
│   │   ├── books/         # Book CRUD operations
│   │   ├── challenges/    # Challenge management
│   │   ├── chapter-notes/ # Reading annotations
│   │   ├── dashboard/     # Dashboard data
│   │   ├── friends/       # Social connections
│   │   ├── groups/        # Group management
│   │   ├── leaderboard/   # Ranking calculations
│   │   ├── profile/       # Profile management
│   │   ├── quotes/        # Quote collection
│   │   ├── ratings/       # Book ratings
│   │   ├── reading-*/     # Various reading analytics
│   │   └── vocabulary/    # Word learning
│   ├── favicon.ico
│   ├── globals.css        # Global styles and Tailwind config
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Marketing landing page
├── components/
│   ├── achievements/      # Achievement UI components
│   ├── books/            # Book-related components
│   ├── challenges/       # Challenge components
│   ├── dashboard/        # Dashboard widgets and layout
│   ├── friends/          # Social features
│   ├── groups/           # Group management UI
│   ├── landing/          # Marketing page components
│   ├── layout/           # Navigation and layout
│   ├── leaderboard/      # Ranking displays
│   ├── memory-palace/    # Memory association features
│   ├── profile/          # Profile management
│   ├── reading/          # Reading session tools
│   ├── reminders/        # Reminder system
│   ├── theme/            # Theme switching
│   └── ui/               # Reusable UI components (shadcn/ui)
├── lib/
│   ├── achievements.ts   # Achievement logic
│   ├── auth.ts          # Authentication configuration
│   ├── challenges.ts    # Challenge utilities
│   ├── db.ts            # Database connection
│   ├── reading-speed.ts # Speed calculation utilities
│   ├── streaks.ts       # Streak tracking logic
│   ├── timezone.ts      # Timezone utilities
│   └── utils.ts         # General utilities
├── prisma/
│   ├── migrations/      # Database migration files
│   └── schema.prisma    # Database schema definition
├── components.json      # shadcn/ui configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies and scripts
├── tailwind.config.*    # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Database Schema

### Core Models
- **User**: User profiles with timezone support, bio, and social connections
- **Book**: Comprehensive book tracking with series, priority, and status management
- **ReadingLog**: Daily reading progress with automatic date-based uniqueness
- **ReadingGoal**: Flexible goal system supporting multiple periods and types

### Reading Experience
- **ReadingSession**: Timed reading sessions with location tracking and GPS coordinates
- **ReadingSpeedTest**: Reading speed measurements and progress tracking
- **ReadingJournal**: Personal reading reflections and thoughts
- **ChapterNote**: Detailed chapter-by-chapter annotations
- **Vocabulary**: Word learning and language building tracker
- **Quote**: Quote collection with page references

### Social Features
- **Friendship**: Friend connections with status management (pending/accepted/blocked)
- **Group**: Reading clubs with public/private visibility and topics
- **GroupMember**: Group membership with role-based permissions (member/moderator/admin)
- **GroupMessage**: Real-time group chat with threading and reactions
- **Challenge**: Reading challenges with flexible target types
- **ChallengeParticipant**: Challenge participation tracking

### Advanced Features
- **BookRead**: Re-reading tracking with separate ratings per read
- **BookLoan**: Book lending management with borrower tracking
- **BookMemory**: Memory Palace associations linking books to life events and locations
- **Rating**: Multi-dimensional book ratings (plot, characters, writing, pacing)
- **Achievement**: Milestone tracking for reading accomplishments
- **Reminder**: Customizable reading reminders with scheduling
- **DashboardPreference**: Personalized dashboard widget configurations

## Development

### Available Scripts
- `npm run dev` - Start development server with webpack bundling
- `npm run build` - Build for production with webpack optimization
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Database Management
- `npx prisma migrate dev` - Create and apply database migrations
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma generate` - Generate Prisma client from schema
- `npx prisma db push` - Push schema changes to database (development)

### Development Tools
- **Prisma Studio**: Visual database management interface
- **ESLint**: Code linting and formatting
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design tokens

## Deployment

ReadHub is optimized for deployment on **Vercel** with **Supabase** as the PostgreSQL database provider.

### 🚀 Quick Deploy

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Supabase Setup**: Create a Supabase project and obtain your database URL
3. **Vercel Deployment**: Connect your GitHub repo to Vercel and configure environment variables
4. **OAuth Configuration**: Set up OAuth apps and update callback URLs

### 📋 Environment Variables Required

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
```

### 📖 Detailed Instructions

For comprehensive deployment guidance including:
- Step-by-step Supabase configuration
- Vercel project setup and optimization
- OAuth provider setup
- Database migration strategies
- Performance optimization tips

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment documentation.

## License

MIT
