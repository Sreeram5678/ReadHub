"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { LogReadingForm } from "@/components/reading/LogReadingForm"
import { DraggableWidgetGrid } from "./DraggableWidgetGrid"
import { WidgetCustomizationPanel } from "./WidgetCustomizationPanel"
import {
  DEFAULT_WIDGETS,
  WidgetInstance,
  WidgetConfig,
  mergeWidgetPreferences,
  getDefaultWidgetInstances,
} from "./widgetsConfig"
import { ReadingStreakWidget } from "./widgets/ReadingStreakWidget"
import { StatsWidget } from "./widgets/StatsWidget"
import { WeeklyMonthlyWidget } from "./widgets/WeeklyMonthlyWidget"
import { ReadingGoals } from "./ReadingGoals"
import { ReadingTrendsChart } from "./ReadingTrendsChart"
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
import { Button } from "@/components/ui/button"
import { LayoutGrid } from "lucide-react"

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

interface CurrentlyReadingBook {
  id: string
  title: string
  author: string
  totalPages: number
  currentPage: number
  initialPages: number
  readingLogs: Array<{ pagesRead: number }>
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
  savedPreferences?: WidgetInstance[] | null
  currentlyReadingBooks?: CurrentlyReadingBook[]
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
  savedPreferences,
  currentlyReadingBooks = [],
}: DashboardProps) {
  const router = useRouter()
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [widgets, setWidgets] = useState<WidgetInstance[]>(() =>
    mergeWidgetPreferences(savedPreferences ?? null, DEFAULT_WIDGETS)
  )

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

  const savePreferences = useCallback(
    async (updatedWidgets: WidgetInstance[]) => {
      try {
        const response = await fetch("/api/dashboard/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ widgets: updatedWidgets }),
        })

        if (!response.ok) {
          throw new Error("Failed to save preferences")
        }
      } catch (error) {
        console.error("Error saving preferences:", error)
      }
    },
    []
  )

  const debouncedSave = useMemo(() => {
    let timeout: NodeJS.Timeout
    return (updatedWidgets: WidgetInstance[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        savePreferences(updatedWidgets)
      }, 500)
    }
  }, [savePreferences])

  const handleWidgetReorder = (updatedWidgets: WidgetInstance[]) => {
    setWidgets(updatedWidgets)
    debouncedSave(updatedWidgets)
  }

  const handleWidgetsChange = (updatedWidgets: WidgetInstance[]) => {
    setWidgets(updatedWidgets)
    savePreferences(updatedWidgets)
  }

  const handleReset = () => {
    const defaults = getDefaultWidgetInstances()
    setWidgets(defaults)
    savePreferences(defaults)
  }

  const renderWidget = (widget: WidgetInstance, config: WidgetConfig) => {
    const props = {
      readingStreak,
      totalBooks,
      completedBooks,
      completionPercentage,
      totalPagesRead,
      todayPages,
      weeklyPages,
      monthlyPages,
      daysReadThisWeek,
      daysReadThisMonth,
      recentLogs,
      books,
      readingTrends,
      readingGoals,
      currentlyReadingBooks,
      onLogAdded: refreshData,
      onGoalAdded: refreshData,
      onLogUpdated: refreshData,
    }

    switch (widget.id) {
      case "streak":
        return <ReadingStreakWidget readingStreak={readingStreak} />
      case "stats":
        return (
          <StatsWidget
            totalBooks={totalBooks}
            completedBooks={completedBooks}
            completionPercentage={completionPercentage}
            totalPagesRead={totalPagesRead}
            todayPages={todayPages}
          />
        )
      case "weeklyMonthly":
        return (
          <WeeklyMonthlyWidget
            weeklyPages={weeklyPages}
            monthlyPages={monthlyPages}
            daysReadThisWeek={daysReadThisWeek}
            daysReadThisMonth={daysReadThisMonth}
          />
        )
      case "goals":
        return (
          <ReadingGoals
            goals={readingGoals}
            currentProgress={{
              daily: todayPages,
              weekly: weeklyPages,
              monthly: monthlyPages,
            }}
            onGoalAdded={refreshData}
          />
        )
      case "trends":
        return <ReadingTrendsChartLazy trends={readingTrends} />
      case "sessionTimer":
        return <ReadingSessionTimer books={books} />
      case "dailyQuote":
        return <DailyQuote />
      case "quickLog":
        return <QuickReadingLog books={books} onLogAdded={refreshData} />
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
            recentLogs={recentLogs}
            onLogUpdated={refreshData}
          />
        )
      case "readingPace":
        return <ReadingPaceWidget readingTrends={readingTrends} />
      case "currentlyReading":
        return <CurrentlyReadingFocusWidget books={currentlyReadingBooks} />
      default:
        return null
    }
  }

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
          {isCustomizing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomizing(false)}
            >
              Done Customizing
            </Button>
          )}
          <WidgetCustomizationPanel
            widgets={widgets}
            widgetConfigs={DEFAULT_WIDGETS}
            onWidgetsChange={handleWidgetsChange}
            onReset={handleReset}
          />
          {!isCustomizing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomizing(true)}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Arrange Widgets
            </Button>
          )}
          <LogReadingForm books={books} onLogAdded={refreshData} />
        </div>
      </div>

      {isCustomizing && (
        <div className="bg-muted/50 border border-dashed rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Drag widgets to reorder them. Use the customize button to show/hide widgets.
          </p>
        </div>
      )}

      <DraggableWidgetGrid
        widgets={widgets}
        widgetConfigs={DEFAULT_WIDGETS}
        isCustomizing={isCustomizing}
        onWidgetReorder={handleWidgetReorder}
        renderWidget={renderWidget}
      />
    </div>
  )
}
