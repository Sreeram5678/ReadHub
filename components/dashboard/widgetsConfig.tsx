"use client"

import { ReactNode } from "react"
import { ReadingStreakWidget } from "./widgets/ReadingStreakWidget"
import { StatsWidget } from "./widgets/StatsWidget"
import { WeeklyMonthlyWidget } from "./widgets/WeeklyMonthlyWidget"
import { ReadingGoals } from "../ReadingGoals"
import { ReadingTrendsChart } from "../ReadingTrendsChart"
import { ReadingSessionTimer } from "@/components/reading/ReadingSessionTimer"
import { DailyQuote } from "@/components/reading/DailyQuote"
import { QuickReadingLog } from "@/components/reading/QuickReadingLog"
import { ReadingSpeedTest } from "@/components/reading/ReadingSpeedTest"
import { ReadingStreakHeatmap } from "../ReadingStreakHeatmap"
import { AchievementsList } from "@/components/achievements/AchievementsList"
import { QuickStatsWidget } from "../QuickStatsWidget"
import { RecentActivityWidget } from "./widgets/RecentActivityWidget"
import { ReadingPaceWidget } from "./widgets/ReadingPaceWidget"
import { CurrentlyReadingFocusWidget } from "./widgets/CurrentlyReadingFocusWidget"
import dynamic from "next/dynamic"

const ReadingTrendsChartLazy = dynamic(() => import("../ReadingTrendsChart").then(mod => ({ default: mod.ReadingTrendsChart })), {
  loading: () => (
    <div className="h-[300px] flex items-center justify-center">
      <p className="text-muted-foreground">Loading chart...</p>
    </div>
  ),
  ssr: false,
})

export type WidgetId = 
  | "streak"
  | "stats"
  | "weeklyMonthly"
  | "goals"
  | "trends"
  | "sessionTimer"
  | "dailyQuote"
  | "quickLog"
  | "speedTest"
  | "quickStats"
  | "heatmap"
  | "achievements"
  | "recentActivity"
  | "readingPace"
  | "currentlyReading"

export type WidgetSize = "small" | "medium" | "large" | "full"

export interface WidgetConfig {
  id: WidgetId
  title: string
  description?: string
  defaultSize: WidgetSize
  defaultVisible: boolean
  category: "stats" | "activity" | "tools" | "goals"
  component: (props: any) => ReactNode
  gridCols?: number // Number of columns this widget spans (1-4)
}

export interface WidgetInstance {
  id: WidgetId
  visible: boolean
  order: number
  size?: WidgetSize
}

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "streak",
    title: "Reading Streak",
    description: "Consecutive days reading",
    defaultSize: "small",
    defaultVisible: true,
    category: "stats",
    gridCols: 1,
    component: ReadingStreakWidget,
  },
  {
    id: "stats",
    title: "Key Stats",
    description: "Total books, pages, and completion",
    defaultSize: "large",
    defaultVisible: true,
    category: "stats",
    gridCols: 1,
    component: StatsWidget,
  },
  {
    id: "weeklyMonthly",
    title: "Weekly & Monthly",
    description: "This week and month progress",
    defaultSize: "medium",
    defaultVisible: true,
    category: "stats",
    gridCols: 1,
    component: WeeklyMonthlyWidget,
  },
  {
    id: "goals",
    title: "Reading Goals",
    description: "Track your reading targets",
    defaultSize: "medium",
    defaultVisible: true,
    category: "goals",
    gridCols: 1,
    component: ReadingGoals,
  },
  {
    id: "trends",
    title: "Reading Trends",
    description: "Your reading activity over the last 30 days",
    defaultSize: "large",
    defaultVisible: true,
    category: "activity",
    gridCols: 1,
    component: ReadingTrendsChartLazy,
  },
  {
    id: "sessionTimer",
    title: "Reading Timer",
    description: "Track your reading sessions",
    defaultSize: "medium",
    defaultVisible: true,
    category: "tools",
    gridCols: 1,
    component: ReadingSessionTimer,
  },
  {
    id: "dailyQuote",
    title: "Daily Quote",
    description: "Inspirational reading quote",
    defaultSize: "medium",
    defaultVisible: true,
    category: "tools",
    gridCols: 1,
    component: DailyQuote,
  },
  {
    id: "quickLog",
    title: "Quick Log",
    description: "Quickly log your reading",
    defaultSize: "medium",
    defaultVisible: true,
    category: "tools",
    gridCols: 1,
    component: QuickReadingLog,
  },
  {
    id: "speedTest",
    title: "Reading Speed Test",
    description: "Test your reading speed",
    defaultSize: "medium",
    defaultVisible: true,
    category: "tools",
    gridCols: 1,
    component: ReadingSpeedTest,
  },
  {
    id: "quickStats",
    title: "Quick Stats",
    description: "Share your reading progress",
    defaultSize: "medium",
    defaultVisible: true,
    category: "stats",
    gridCols: 1,
    component: QuickStatsWidget,
  },
  {
    id: "heatmap",
    title: "Reading Heatmap",
    description: "Your reading activity over time",
    defaultSize: "full",
    defaultVisible: true,
    category: "activity",
    gridCols: 1,
    component: ReadingStreakHeatmap,
  },
  {
    id: "achievements",
    title: "Achievements",
    description: "Your reading milestones",
    defaultSize: "medium",
    defaultVisible: true,
    category: "activity",
    gridCols: 1,
    component: AchievementsList,
  },
  {
    id: "recentActivity",
    title: "Recent Activity",
    description: "Your latest reading logs",
    defaultSize: "medium",
    defaultVisible: true,
    category: "activity",
    gridCols: 1,
    component: RecentActivityWidget,
  },
  {
    id: "readingPace",
    title: "Reading Pace",
    description: "Average pages per day",
    defaultSize: "small",
    defaultVisible: false,
    category: "stats",
    gridCols: 1,
    component: ReadingPaceWidget,
  },
  {
    id: "currentlyReading",
    title: "Currently Reading",
    description: "Your active book focus",
    defaultSize: "medium",
    defaultVisible: false,
    category: "activity",
    gridCols: 1,
    component: CurrentlyReadingFocusWidget,
  },
]

export function getDefaultWidgetInstances(): WidgetInstance[] {
  return DEFAULT_WIDGETS.map((widget, index) => ({
    id: widget.id,
    visible: widget.defaultVisible,
    order: index,
    size: widget.defaultSize,
  }))
}

export function mergeWidgetPreferences(
  savedPreferences: WidgetInstance[] | null,
  defaultWidgets: WidgetConfig[]
): WidgetInstance[] {
  if (!savedPreferences || savedPreferences.length === 0) {
    return getDefaultWidgetInstances()
  }

  const savedMap = new Map(savedPreferences.map((w) => [w.id, w]))
  const result: WidgetInstance[] = []

  // First, add saved preferences in their saved order
  const savedIds = new Set(savedPreferences.map((w) => w.id))
  savedPreferences
    .sort((a, b) => a.order - b.order)
    .forEach((saved) => {
      result.push({
        id: saved.id,
        visible: saved.visible,
        order: result.length,
        size: saved.size,
      })
    })

  // Then, add any new widgets that weren't in saved preferences
  defaultWidgets.forEach((widget, index) => {
    if (!savedIds.has(widget.id)) {
      result.push({
        id: widget.id,
        visible: widget.defaultVisible,
        order: result.length,
        size: widget.defaultSize,
      })
    }
  })

  return result
}

