"use client"

import { ReadingStreakWidget } from "./widgets/ReadingStreakWidget"
import { StatsWidget } from "./widgets/StatsWidget"
import { WeeklyMonthlyWidget } from "./widgets/WeeklyMonthlyWidget"
import { ReadingGoals } from "./ReadingGoals"
import { ReadingSessionTimer } from "@/components/reading/ReadingSessionTimer"
import { DailyQuote } from "@/components/reading/DailyQuote"
import { QuickReadingLog } from "@/components/reading/QuickReadingLog"
import { ReadingSpeedTest } from "@/components/reading/ReadingSpeedTest"
import { ReadingStreakHeatmap } from "./ReadingStreakHeatmap"
import { AchievementsList } from "@/components/achievements/AchievementsList"
import { QuickStatsWidget } from "./QuickStatsWidget"
import { RecentActivityWidget } from "./widgets/RecentActivityWidget"
import { ReadingPaceWidget } from "./widgets/ReadingPaceWidget"
import { CurrentlyReadingFocusWidget } from "./widgets/CurrentlyReadingFocusWidget"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import type { DashboardContextValue } from "./DashboardContext"
import { WidgetId } from "./widgetsConfig"

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

export function renderWidget(widgetId: WidgetId, dashboard: DashboardContextValue) {
  const refreshData = dashboard.onRefresh

  switch (widgetId) {
    case "streak":
      return <ReadingStreakWidget readingStreak={dashboard.readingStreak} />

    case "stats":
      return (
        <StatsWidget
          totalBooks={dashboard.totalBooks}
          completedBooks={dashboard.completedBooks}
          completionPercentage={dashboard.completionPercentage}
          totalPagesRead={dashboard.totalPagesRead}
          todayPages={dashboard.todayPages}
        />
      )

    case "weeklyMonthly":
      return (
        <WeeklyMonthlyWidget
          weeklyPages={dashboard.weeklyPages}
          monthlyPages={dashboard.monthlyPages}
          daysReadThisWeek={dashboard.daysReadThisWeek}
          daysReadThisMonth={dashboard.daysReadThisMonth}
        />
      )

    case "goals":
      return (
        <ReadingGoals
          goals={dashboard.readingGoals}
          currentProgress={{
            daily: dashboard.todayPages,
            weekly: dashboard.weeklyPages,
            monthly: dashboard.monthlyPages,
          }}
          onGoalAdded={refreshData}
        />
      )

    case "trends":
      return <ReadingTrendsChartLazy trends={dashboard.readingTrends} />

    case "sessionTimer":
      return <ReadingSessionTimer books={dashboard.books} />

    case "dailyQuote":
      return <DailyQuote />

    case "quickLog":
      return <QuickReadingLog books={dashboard.books} onLogAdded={refreshData} />

    case "speedTest":
      return <ReadingSpeedTest />

    case "quickStats":
      return <QuickStatsWidget />

    case "heatmap":
      return <ReadingStreakHeatmap />

    case "achievements":
      return <AchievementsList />

    case "recentActivity":
      return (
        <RecentActivityWidget
          recentLogs={dashboard.recentLogs}
          onLogUpdated={refreshData}
        />
      )

    case "readingPace":
      return <ReadingPaceWidget readingTrends={dashboard.readingTrends} />

    case "currentlyReading":
      return (
        <CurrentlyReadingFocusWidget books={dashboard.currentlyReadingBooks} />
      )

    default:
      return null
  }
}

