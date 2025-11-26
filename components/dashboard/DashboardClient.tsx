"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { LogReadingForm } from "@/components/reading/LogReadingForm"
import { DraggableWidgetGrid } from "./DraggableWidgetGrid"
import { WidgetCustomizationPanel } from "./WidgetCustomizationPanel"
import { DashboardProvider, useDashboard } from "./DashboardContext"
import { Button } from "@/components/ui/button"
import { GripHorizontal, X } from "lucide-react"
import {
  DEFAULT_WIDGETS,
  getDefaultWidgetInstances,
  mergeWidgetPreferences,
  WidgetInstance,
  WidgetConfig,
  WidgetId,
} from "./widgetsConfig"
import { renderWidget } from "./widgetRenderer"

interface Book {
  id: string
  title: string
  author: string
  totalPages?: number
  currentPage?: number
  initialPages?: number
  readingLogs?: Array<{ pagesRead: number }>
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
  currentlyReadingBooks: Book[]
  savedPreferences: WidgetInstance[] | null
}

function DashboardContent() {
  const dashboard = useDashboard()
  const router = useRouter()
  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    return mergeWidgetPreferences(dashboard.savedPreferences, DEFAULT_WIDGETS)
  })
  const [isCustomizing, setIsCustomizing] = useState(false)

  const refreshData = useCallback(() => {
    router.refresh()
  }, [router])

  const handleWidgetsChange = useCallback(async (newWidgets: WidgetInstance[]) => {
    setWidgets(newWidgets)
    
    try {
      await fetch("/api/dashboard/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets: newWidgets }),
      })
    } catch (error) {
      console.error("Failed to save dashboard preferences:", error)
    }
  }, [])

  const handleReset = useCallback(async () => {
    const defaults = getDefaultWidgetInstances()
    setWidgets(defaults)
    
    try {
      await fetch("/api/dashboard/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets: defaults }),
      })
    } catch (error) {
      console.error("Failed to reset dashboard preferences:", error)
    }
  }, [])

  const widgetRenderer = useCallback(
    (widget: WidgetInstance, config: WidgetConfig) => {
      return renderWidget(widget.id, dashboard)
    },
    [dashboard]
  )

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Welcome back, {dashboard.userName}!
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isCustomizing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomizing(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Done Customizing
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomizing(true)}
            >
              <GripHorizontal className="mr-2 h-4 w-4" />
              Arrange Widgets
            </Button>
          )}
          <WidgetCustomizationPanel
            widgets={widgets}
            widgetConfigs={DEFAULT_WIDGETS}
            onWidgetsChange={handleWidgetsChange}
            onReset={handleReset}
          />
          <LogReadingForm books={dashboard.books} onLogAdded={refreshData} />
        </div>
      </div>

      <DraggableWidgetGrid
        widgets={widgets}
        widgetConfigs={DEFAULT_WIDGETS}
        isCustomizing={isCustomizing}
        onWidgetReorder={handleWidgetsChange}
        renderWidget={widgetRenderer}
      />

    </div>
  )
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
  currentlyReadingBooks,
  savedPreferences,
}: DashboardProps) {
  const router = useRouter()
  
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

  const refreshData = () => {
    router.refresh()
  }

  const contextValue = {
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
    weeklyPages,
    monthlyPages,
    currentlyReadingBooks,
    savedPreferences: savedPreferences || null,
    onRefresh: refreshData,
  }

  return (
    <DashboardProvider value={contextValue}>
      <DashboardContent />
    </DashboardProvider>
  )
}
