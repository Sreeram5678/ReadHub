"use client"

import { createContext, useContext, ReactNode } from "react"

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

import type { WidgetInstance } from "./widgetsConfig"

export interface DashboardContextValue {
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
  weeklyPages: number
  monthlyPages: number
  currentlyReadingBooks: Book[]
  savedPreferences: WidgetInstance[] | null
  onRefresh: () => void
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined)

export function DashboardProvider({
  children,
  value,
}: {
  children: ReactNode
  value: DashboardContextValue
}) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider")
  }
  return context
}

