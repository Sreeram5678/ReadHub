"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { LogReadingForm } from "@/components/reading/LogReadingForm"
import { ReadingStreakWidget } from "./widgets/ReadingStreakWidget"
import { StatsWidget } from "./widgets/StatsWidget"
import { ThisWeekWidget } from "./widgets/ThisWeekWidget"
import { ThisMonthWidget } from "./widgets/ThisMonthWidget"
import { ReadingGoals } from "./ReadingGoals"
import { ReadingSessionTimer } from "@/components/reading/ReadingSessionTimer"
import { DailyQuote } from "@/components/reading/DailyQuote"
import { QuickReadingLog } from "@/components/reading/QuickReadingLog"
import { ReadingSpeedTest } from "@/components/reading/ReadingSpeedTest"
import { ReadingStreakHeatmap } from "./ReadingStreakHeatmap"
import { AchievementsList } from "@/components/achievements/AchievementsList"
import { QuickStatsWidget } from "./QuickStatsWidget"
import { RecentActivityWidget } from "./widgets/RecentActivityWidget"
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
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Welcome back, {userName}!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LogReadingForm books={books} onLogAdded={refreshData} />
        </div>
      </div>

      {/* Row 1: key stats */}
      <StatsWidget
        totalBooks={totalBooks}
        completedBooks={completedBooks}
        completionPercentage={completionPercentage}
        totalPagesRead={totalPagesRead}
        todayPages={todayPages}
      />

      {/* Row 2: streak + weekly + monthly + goals */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <ReadingStreakWidget readingStreak={readingStreak} />
        <ThisWeekWidget
          weeklyPages={weeklyPages}
          daysReadThisWeek={daysReadThisWeek}
        />
        <ThisMonthWidget
          monthlyPages={monthlyPages}
          daysReadThisMonth={daysReadThisMonth}
        />
        <ReadingGoals
          goals={readingGoals}
          currentProgress={{
            daily: todayPages,
            weekly: weeklyPages,
            monthly: monthlyPages,
          }}
          onGoalAdded={refreshData}
        />
      </div>

      {/* Row 3: trends + timer */}
      <div className="grid gap-4 md:grid-cols-2">
        <ReadingTrendsChartLazy trends={readingTrends} />
        <ReadingSessionTimer books={books} />
      </div>

      {/* Row 4: daily quote + quick log */}
      <div className="grid gap-4 md:grid-cols-2">
        <DailyQuote />
        <QuickReadingLog books={books} onLogAdded={refreshData} />
      </div>

      {/* Row 5: heatmap */}
      <ReadingStreakHeatmap />

      {/* Row 6: achievements + quick stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <AchievementsList />
        <QuickStatsWidget />
      </div>

      {/* Row 7: recent activity */}
      <RecentActivityWidget recentLogs={recentLogs} onLogUpdated={refreshData} />
    </div>
  )
}
