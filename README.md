# 📚 ReadHub

> **Transform your reading journey into an epic adventure**

Imagine a reading tracker that doesn't just count your pages—it becomes your literary companion, your motivation coach, and your social reading network all in one. ReadHub is where book lovers unite to track, compete, and deepen their connection with stories.

**What makes ReadHub magical:**
- GPS-tracked reading sessions that remember where your favorite books came alive
- Memory Palace that associates books with real-life moments and places
- Social reading clubs with real-time chat and collaborative challenges
- Advanced analytics into your reading patterns and preferences
- Achievement system that celebrates every milestone in your literary journey

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2d3748)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)

---

## 📸 **A Glimpse into the Magic**

> **Dashboard Overview**: Your personalized reading command center with customizable widgets
> **Memory Palace**: Associate books with real-world locations and life moments
> **Social Reading Groups**: Connect with fellow book lovers in vibrant communities
> **Reading Analytics**: Beautiful charts showing your literary journey
> **Achievement System**: Celebrate every milestone in your reading adventure

---

## Why Choose ReadHub?

**For the Avid Reader**
> "Finally, a reading app that understands how deeply I connect with books—not just what I read, but where I read it, how it made me feel, and who I want to discuss it with."

**For the Goal-Driven Reader**
> "My reading streak is my lifeline. ReadHub doesn't just track it—it celebrates it, reminds me when I'm slipping, and pushes me to beat my personal records."

**For the Social Reader**
> "Reading was always a solitary activity. Now I have reading buddies, clubs, challenges, and a community that shares my passion for stories."

**For the Analytical Reader**
> "I finally understand my reading patterns. When I'm most productive, which genres I devour fastest, and how my reading speed has improved over time."

## Features That Make Reading Addictive

### Smart Library Management
Turn your book collection into a masterpiece of organization:

- **Series Management**: Never lose track of your favorite series again. Automatically numbers books and shows your progress through epic sagas
- **Priority TBR System**: Your "To Be Read" pile finally makes sense. Rank books by excitement level and watch the most anticipated reads bubble to the top
- **Re-reading Support**: Love a book so much you read it twice? Track each reading experience separately with unique ratings, notes, and timestamps
- **DNF Tracking**: Some books just aren't for us. Record why you didn't finish with custom reasons and learn from your reading choices
- **Book Lending**: Track which friends borrowed your volumes, set due dates, and maintain your lending relationships

### Immersive Reading Experience
Transform reading from a solitary activity into a multi-sensory adventure:

- **GPS Reading Map**: See where your reading happens. From cozy coffee shops to mountain retreats, remember every location where stories came alive
- **Reading Speed Test**: Challenge yourself to read faster. Track WPM improvements and compete with your personal bests
- **Memory Palace**: Associate books with real-world locations and life events. "The café where I fell in love" or "That rainy weekend in Paris"—never forget the context of your favorite reads
- **Reading Journal**: Capture your thoughts, emotions, and insights as you read. Build a personal literary memoir
- **Chapter Notes**: Mark up your books like a scholar. Add notes, highlights, and annotations that grow with each reading
- **Vocabulary Builder**: Build your literary lexicon. Save unfamiliar words, their definitions, and the context where you encountered them
- **Quote Collection**: Collect the most beautiful, profound, or hilarious lines that made you pause and reflect

### Motivation & Achievement Engine
Because reading is a journey worth celebrating:

- **Flexible Goals**: Design reading targets that fit your life. Daily micro-goals for busy weeks, monthly marathons for vacation reading, or custom challenges that match your ambitions
- **Customizable Dashboard**: Your reading command center adapts to you. Choose from preset layouts (Minimal, Analytics, Tools) or craft your perfect dashboard with drag-and-drop widgets
- **Reading Streaks**: Watch your reading consistency grow. Visual streak counters with gentle nudges keep the momentum alive
- **Reading Heatmap**: GitHub-style heatmaps show your literary dedication in vibrant colors. See the beautiful patterns of your reading life unfold
- **Reading Analytics**: Discover your reading patterns. Charts reveal when you're most productive, which genres you devour, and how your pace has evolved
- **Multi-dimensional Ratings**: Rate books across multiple criteria—plot, characters, writing style, pacing. Get nuanced recommendations that actually match your tastes
- **Achievement System**: Unlock badges and milestones that celebrate your reading victories. From "First Chapter" to "Century Club," every accomplishment gets its moment

### Social Reading Features
Reading was never meant to be solitary:

- **Friends & Networking**: Build your reading squad. Send friend requests, follow progress updates, and turn reading into a shared adventure
- **Reading Groups**: Join or create reading clubs. From "Sci-Fi Explorers" to "Romance Readers Anonymous," find your literary tribe
- **Group Chat**: Real-time messaging with reactions and threaded replies. Discuss plot twists while they're still fresh
- **Reading Challenges**: Battle it out with challenges. Yearly page counts, genre marathons, author spotlights—whatever fuels your competitive fire
- **Leaderboards**: Climb the ranks globally or among friends. See how you stack up in real-time with friendly competition
- **Public Profiles**: Share your reading journey, achievements, favorite quotes, and reading stats with the world

### Tools & Utilities
Tools that make reading effortless and addictive:

- **Reading Timer**: Built-in timer for focused reading sessions with automatic progress tracking and location logging
- **Quick Logging**: Rapid progress entry from anywhere in the app. No more hunting for the right page
- **Daily Quotes**: Inspirational quotes from literary giants to fuel your reading motivation
- **Smart Reminders**: Customizable notifications that adapt to your reading patterns and gently nudge you back to your books
- **Reading Speed Test**: Gamified speed tests that turn improvement into an exciting challenge
- **Shareable Stats**: Beautiful, customizable widgets to showcase your reading victories on social media

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

Ready to transform your reading life? Let's get ReadHub running on your machine!

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd readhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file with your secrets:
   ```env
   # Database Connection (choose your realm)
   DATABASE_URL="postgresql://user:password@localhost:5432/readhub?schema=public"
   # Or for local SQLite adventures:
   # DATABASE_URL="file:./dev.db"

   # Authentication Secrets
   NEXTAUTH_SECRET="your-super-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # OAuth Portals (optional but recommended)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

   **OAuth Setup:**
   - **Google**: Go to [Google Cloud Console](https://console.cloud.google.com/) and create OAuth 2.0 credentials
   - **GitHub**: Go to [GitHub Developer Settings](https://github.com/settings/developers) and create a new OAuth App
   - **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) and start your reading journey!

Create your account, add your first book, and watch as your reading life transforms.

## Usage

### Getting Started
1. **Sign up**: Create an account using email/password or OAuth (Google/GitHub)
2. **Add books**: Build your library with comprehensive book information
3. **Customize dashboard**: Choose from preset layouts or create your personalized dashboard
4. **Set goals**: Define reading targets that match your lifestyle

### Core Workflows

#### Library Management
- **Add books**: Comprehensive book entry with author, page count, series information, and genre tags
- **Organize series**: Group books by series with automatic numbering and progress tracking
- **Prioritize TBR**: Rank upcoming reads by excitement level
- **Track re-reads**: Record separate experiences for each time you revisit a book

#### Reading Sessions
- **Use timer**: Create focused reading sessions with automatic progress tracking
- **Location tracking**: GPS-enabled session logging creates a map of your reading locations
- **Speed testing**: Regular WPM assessments to track reading improvement
- **Reading journal**: Record your thoughts, emotions, and insights

#### Goals & Progress
- **Set goals**: Flexible targets for daily, weekly, monthly, or custom periods
- **Track progress**: Visualize your reading journey with charts and trends
- **Reading streaks**: Maintain consistency with streak counters
- **Achievements**: Unlock milestones that celebrate your reading victories

#### Social Features
- **Friends**: Connect with other readers and follow their progress
- **Club Alliances**: Join or create reading clubs with shared challenges and collaborative discussions
- **Challenge Arenas**: Design competitive reading challenges that motivate both you and your community
- **Leaderboard Legends**: Climb rankings globally or among friends, with friendly competition that inspires everyone

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

---

## What Makes ReadHub Extraordinary

### Memory Palace
Imagine walking through a palace where each room holds a cherished reading memory. Associate books with the park bench where you laughed out loud, the airport lounge during your dream vacation, or the cozy armchair on that rainy Sunday. ReadHub creates spatial memory links that make your reading experiences unforgettable and instantly recallable.

### Multi-dimensional Book Reviews
Tired of simple 5-star ratings that don't capture the complexity of great books? Rate across multiple dimensions: plot craftsmanship, character depth, writing elegance, pacing perfection. Discover books that truly match your sophisticated tastes and get recommendations that understand your literary preferences.

### Reading Clubs Reimagined
Traditional book clubs meet modern social features. Real-time chat during reading challenges, collaborative annotations, and group reading sessions. Whether you're discussing the latest thriller or organizing a month-long classics challenge, your reading community feels alive and connected.

### Advanced Re-reading Support
Some books deserve multiple chapters in your life. Track each reading experience separately—how your interpretation evolved, what new insights you gained, how the book affected you differently this time. Build a personal literary history that shows how your relationship with books has matured.

### GPS Reading Cartography
Your reading life told through maps. See the coffee shops where you discovered new authors, the beaches where romance novels came alive, the mountain cabins where mysteries unfolded. Pattern recognition reveals your perfect reading environments and helps you recreate those magical reading moments.

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

ReadHub is optimized for deployment on Vercel with Supabase as the PostgreSQL database provider.

### Quick Deploy

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Supabase Setup**: Create a Supabase project and obtain your database URL
3. **Vercel Deployment**: Connect your GitHub repo to Vercel and configure environment variables
4. **OAuth Configuration**: Set up OAuth apps and update callback URLs

### Environment Variables

```env
# Database Realm
DATABASE_URL="postgresql://user:password@host:5432/readhub?schema=public"

# Authentication Seals
NEXTAUTH_SECRET="your-ultimate-secret-key"
NEXTAUTH_URL="https://your-reading-domain.vercel.app"

# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Detailed Instructions

For comprehensive deployment guidance including:
- Supabase configuration
- Vercel project setup and optimization
- OAuth provider setup
- Database migration strategies
- Performance optimization tips

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment documentation.

---

## Contributing

Ready to help build the future of reading?

- **Star this repository** if you love the vision
- **Report bugs** and **request features** in our GitHub issues
- **Contribute code** to help fellow readers on their journeys
- **Spread the word** about ReadHub in your reading communities

### **Connect with Us**

Have questions about your reading journey? Found a bug? Want to suggest a new feature?

- **Email**: sreeram.lagisetty@gmail.com

---

*"In the end, we will conserve only what we love; we will love only what we understand; and we will understand only what we are taught."*
— *Baba Dioum*

**Start your understanding journey today with ReadHub.**

## License

MIT
