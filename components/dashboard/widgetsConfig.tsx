"use client"

import { ComponentType } from "react"
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

const ReadingTrendsChartLazy = dynamic(() => import("./ReadingTrendsChart").then(mod => ({ default: mod.ReadingTrendsChart })), {
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

export type DashboardPresetId = "standard" | "minimal" | "analytics" | "tools"

export interface WidgetConfig {
  id: WidgetId
  title: string
  description?: string
  defaultSize: WidgetSize
  defaultVisible: boolean
  category: "stats" | "activity" | "tools" | "goals"
  component: ComponentType<any>
  gridCols?: number // Default number of columns this widget spans (1-4)
  minCols?: number  // Minimum columns when resizing
  maxCols?: number  // Maximum columns when resizing
}

export interface WidgetInstance {
  id: WidgetId
  visible: boolean
  order: number
  size?: WidgetSize
  cols?: number
  presetId?: string | null
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
    minCols: 1,
    maxCols: 2,
    component: ReadingStreakWidget,
  },
  {
    id: "stats",
    title: "Key Stats",
    description: "Total books, pages, and completion",
    defaultSize: "large",
    defaultVisible: true,
    category: "stats",
    gridCols: 4,
    minCols: 4,
    maxCols: 4,
    component: StatsWidget,
  },
  {
    id: "weeklyMonthly",
    title: "Weekly & Monthly",
    description: "This week and month progress",
    defaultSize: "medium",
    defaultVisible: true,
    category: "stats",
    gridCols: 2,
    minCols: 2,
    maxCols: 4,
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
    minCols: 1,
    maxCols: 2,
    component: ReadingGoals,
  },
  {
    id: "trends",
    title: "Reading Trends",
    description: "Your reading activity over the last 30 days",
    defaultSize: "large",
    defaultVisible: true,
    category: "activity",
    gridCols: 2,
    minCols: 1,
    maxCols: 4,
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
    minCols: 1,
    maxCols: 2,
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
    minCols: 1,
    maxCols: 2,
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
    minCols: 1,
    maxCols: 2,
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
    minCols: 1,
    maxCols: 2,
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
    minCols: 1,
    maxCols: 2,
    component: QuickStatsWidget,
  },
  {
    id: "heatmap",
    title: "Reading Heatmap",
    description: "Your reading activity over time",
    defaultSize: "full",
    defaultVisible: true,
    category: "activity",
    gridCols: 4,
    minCols: 4,
    maxCols: 4,
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
    minCols: 1,
    maxCols: 2,
    component: AchievementsList,
  },
  {
    id: "recentActivity",
    title: "Recent Activity",
    description: "Your latest reading logs",
    defaultSize: "medium",
    defaultVisible: true,
    category: "activity",
    gridCols: 2,
    minCols: 1,
    maxCols: 4,
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
    minCols: 1,
    maxCols: 2,
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
    minCols: 1,
    maxCols: 2,
    component: CurrentlyReadingFocusWidget,
  },
]

export function getDefaultWidgetInstances(): WidgetInstance[] {
  // Return minimal preset widgets as default for cleaner, organized dashboard
  // This is defined inline to avoid circular dependency
  const minimalWidgets: Array<{ id: WidgetId; visible: boolean; cols: number }> = [
    { id: "streak", cols: 1, visible: true },
    { id: "stats", cols: 3, visible: true },
    { id: "weeklyMonthly", cols: 2, visible: true },
    { id: "quickLog", cols: 2, visible: true },
    { id: "recentActivity", cols: 2, visible: true },
  ]
  
  const configMap = new Map(DEFAULT_WIDGETS.map((w) => [w.id, w]))
  
  return minimalWidgets.map((item, index) => {
    const config = configMap.get(item.id)
    return {
      id: item.id,
      visible: item.visible,
      order: index,
      size: config?.defaultSize ?? "medium",
      cols: item.cols,
      presetId: "minimal" as DashboardPresetId,
    }
  })
}

export function mergeWidgetPreferences(
  savedPreferences: WidgetInstance[] | null,
  defaultWidgets: WidgetConfig[]
): WidgetInstance[] {
  if (!savedPreferences || savedPreferences.length === 0) {
    // Return minimal preset as default for new users
    return getDefaultWidgetInstances()
  }

  const configMap = new Map(defaultWidgets.map((w) => [w.id, w]))
  const result: WidgetInstance[] = []

  // First, add saved preferences in their saved order
  const savedIds = new Set(savedPreferences.map((w) => w.id))
  savedPreferences
    .sort((a, b) => a.order - b.order)
    .forEach((saved) => {
      const config = configMap.get(saved.id)
      result.push({
        id: saved.id,
        visible: saved.visible,
        order: result.length,
        size: saved.size ?? config?.defaultSize,
        cols: saved.cols ?? config?.gridCols ?? 1,
        presetId: saved.presetId ?? null,
      })
    })

  // Then, add any new widgets that weren't in saved preferences
  defaultWidgets.forEach((widget) => {
    if (!savedIds.has(widget.id)) {
      result.push({
        id: widget.id,
        visible: widget.defaultVisible,
        order: result.length,
        size: widget.defaultSize,
        cols: widget.gridCols ?? 1,
        presetId: null,
      })
    }
  })

  return result
}

function createPresetInstances(
  presetId: DashboardPresetId,
  items: Array<{ id: WidgetId; visible?: boolean; cols?: number }>
): WidgetInstance[] {
  const configMap = new Map(DEFAULT_WIDGETS.map((w) => [w.id, w]))

  return items.map((item, index) => {
    const config = configMap.get(item.id)
    return {
      id: item.id,
      visible: item.visible ?? config?.defaultVisible ?? true,
      order: index,
      size: config?.defaultSize ?? "medium",
      cols: item.cols ?? config?.gridCols ?? 1,
      presetId,
    }
  })
}

export const DASHBOARD_PRESETS: Record<DashboardPresetId, WidgetInstance[]> = {
  // Default layout: what you currently see (balanced general view)
  standard: createPresetInstances("standard", [
    { id: "stats", cols: 4, visible: true },
    { id: "streak", cols: 1, visible: true },
    { id: "weeklyMonthly", cols: 3, visible: true },
    { id: "goals", cols: 2, visible: true },
    { id: "trends", cols: 2, visible: true },
    { id: "sessionTimer", cols: 2, visible: true },
    { id: "dailyQuote", cols: 2, visible: true },
    { id: "quickLog", cols: 2, visible: true },
    { id: "heatmap", cols: 4, visible: true },
    { id: "achievements", cols: 2, visible: true },
    { id: "quickStats", cols: 2, visible: true },
    { id: "recentActivity", cols: 2, visible: true },
    { id: "readingPace", cols: 1, visible: false },
    { id: "currentlyReading", cols: 2, visible: false },
  ]),
  // Minimal: focus on just streak, key stats, and quick log
  minimal: createPresetInstances("minimal", [
    { id: "streak", cols: 1, visible: true },
    { id: "stats", cols: 3, visible: true },
    { id: "weeklyMonthly", cols: 2, visible: true },
    { id: "quickLog", cols: 2, visible: true },
    { id: "recentActivity", cols: 2, visible: true },
  ]),
  // Analytics: heavy on charts and activity
  analytics: createPresetInstances("analytics", [
    { id: "stats", cols: 4, visible: true },
    { id: "readingPace", cols: 2, visible: true },
    { id: "weeklyMonthly", cols: 2, visible: true },
    { id: "trends", cols: 2, visible: true },
    { id: "heatmap", cols: 4, visible: true },
    { id: "recentActivity", cols: 2, visible: true },
    { id: "achievements", cols: 2, visible: true },
  ]),
  // Tools: focus on timers, speed tests, quotes, and quick actions
  tools: createPresetInstances("tools", [
    { id: "streak", cols: 1, visible: true },
    { id: "stats", cols: 3, visible: true },
    { id: "sessionTimer", cols: 2, visible: true },
    { id: "readingPace", cols: 2, visible: true },
    { id: "speedTest", cols: 2, visible: true },
    { id: "dailyQuote", cols: 2, visible: true },
    { id: "quickLog", cols: 2, visible: true },
    { id: "quickStats", cols: 2, visible: true },
  ]),
}

