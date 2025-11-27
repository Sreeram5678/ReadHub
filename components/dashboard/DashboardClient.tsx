"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { LogReadingForm } from "@/components/reading/LogReadingForm"
import { ReadingGoals } from "./ReadingGoals"
import { ReadingSessionTimer } from "@/components/reading/ReadingSessionTimer"
import { DailyQuote } from "@/components/reading/DailyQuote"
import { QuickReadingLog } from "@/components/reading/QuickReadingLog"
import { ReadingSpeedTest } from "@/components/reading/ReadingSpeedTest"
import { ReadingStreakHeatmap } from "./ReadingStreakHeatmap"
import { AchievementsList } from "@/components/achievements/AchievementsList"
import { QuickStatsWidget } from "./QuickStatsWidget"
import { RecentActivityWidget } from "./widgets/RecentActivityWidget"
import { DashboardHero } from "./DashboardHero"
import { StatCard } from "@/components/ui/StatCard"
import { BookOpen, BookOpenCheck, Calendar, Flame, Target } from "lucide-react"
import dynamic from "next/dynamic"

const ReadingTrendsChartLazy = dynamic(
  () => import("./ReadingTrendsChart").then((mod) => ({ default: mod.ReadingTrendsChart })),
  {
    loading: () => (
      <Card>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </Card>
    ),
    ssr: false,
  }
)

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  currentPage?: number | null
  initialPages?: number | null
}

interface ReadingLog {
  id: string
  pagesRead: number
  date: Date
  book: {
    title: string
  }
}

interface ReadingGoal {
  id: string
  type: string
  target: number
  period: string
  startDate: Date
  endDate: Date
}

interface ReadingTrend {
  date: Date
  pagesRead: number
}

interface DashboardProps {
  totalBooks: number
  completedBooks: number
  completionPercentage: number
  totalPagesRead: number
  todayPages: number
  recentLogs: ReadingLog[]
  books: Book[]
  userName: string
  readingStreak: number
  daysReadThisWeek: number
  daysReadThisMonth: number
  readingTrends: ReadingTrend[]
  readingGoals: ReadingGoal[]
}

export function DashboardClient({
  totalBooks,
  completedBooks,
  completionPercentage,
  totalPagesRead,
  todayPages,
  recentLogs,
  books,
  userName,
  readingStreak,
  daysReadThisWeek,
  daysReadThisMonth,
  readingTrends,
  readingGoals,
}: DashboardProps) {
  const router = useRouter()
  const refreshData = () => {
    router.refresh()
  }

  const { weeklyPages, monthlyPages } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const weekly = readingTrends
      .filter((t) => new Date(t.date) >= weekStart)
      .reduce((sum, t) => sum + t.pagesRead, 0)

    const monthly = readingTrends
      .filter((t) => new Date(t.date) >= monthStart)
      .reduce((sum, t) => sum + t.pagesRead, 0)

    return { weeklyPages: weekly, monthlyPages: monthly }
  }, [readingTrends])

  return (
    <div className="space-y-10">
      <DashboardHero
        userName={userName}
        totalPagesRead={totalPagesRead}
        todayPages={todayPages}
        readingStreak={readingStreak}
        completionPercentage={completionPercentage}
      />

      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="h-full">
          <ReadingTrendsChartLazy trends={readingTrends} />
        </Card>
        <div className="space-y-6">
          <div className="card-surface rounded-[1.5rem] border border-card-border/70 bg-[color:var(--surface)] p-6 shadow-[var(--card-shadow)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Deep session</p>
                <p className="serif-heading text-2xl text-[color:var(--text)]">Reading Timer</p>
              </div>
              <LogReadingForm books={books} onLogAdded={refreshData} />
            </div>
            <div className="mt-4 rounded-[1.25rem] border border-card-border/70 p-4">
              <ReadingSessionTimer books={books} />
            </div>
          </div>
          <QuickReadingLog books={books} onLogAdded={refreshData} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Library"
          value={`${totalBooks} books`}
          description={`${completedBooks} completed`}
          icon={<BookOpen className="h-4 w-4 text-[color:var(--accent)]" />}
        />
        <StatCard
          label="Streak"
          value={`${readingStreak} days`}
          description="Consecutive days logged"
          icon={<Flame className="h-4 w-4 text-[color:var(--accent)]" />}
        />
        <StatCard
          label="Today"
          value={`${todayPages} pages`}
          description="Pages logged today"
          icon={<BookOpenCheck className="h-4 w-4 text-[color:var(--accent)]" />}
        />
        <StatCard
          label="Weekly"
          value={`${weeklyPages} pages`}
          description={`${daysReadThisWeek} active days`}
          icon={<Calendar className="h-4 w-4 text-[color:var(--accent)]" />}
        />
        <StatCard
          label="Monthly"
          value={`${monthlyPages} pages`}
          description={`${daysReadThisMonth} reading days`}
          icon={<Target className="h-4 w-4 text-[color:var(--accent)]" />}
        />
        <div className="xl:col-span-1 md:col-span-2">
          <QuickStatsWidget />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ReadingGoals
          goals={readingGoals}
          currentProgress={{
            daily: todayPages,
            weekly: weeklyPages,
            monthly: monthlyPages,
          }}
          onGoalAdded={refreshData}
        />
        <div className="grid gap-6">
          <DailyQuote />
          <ReadingSpeedTest />
        </div>
      </section>

      <ReadingStreakHeatmap />

      <section className="grid gap-6 lg:grid-cols-2">
        <AchievementsList />
        <RecentActivityWidget recentLogs={recentLogs} onLogUpdated={refreshData} />
      </section>
    </div>
  )
}
