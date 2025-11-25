"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogReadingForm } from "@/components/reading/LogReadingForm"
import { EditReadingLogForm } from "@/components/reading/EditReadingLogForm"
import { ReadingGoals } from "./ReadingGoals"
import { ReadingTrendsChart } from "./ReadingTrendsChart"
import { ReadingSessionTimer } from "@/components/reading/ReadingSessionTimer"
import { Button } from "@/components/ui/button"
import { Flame, Pencil } from "lucide-react"
import dynamic from "next/dynamic"

// Lazy load the chart component for better initial load performance
const ReadingTrendsChartLazy = dynamic(() => import("./ReadingTrendsChart").then(mod => ({ default: mod.ReadingTrendsChart })), {
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle>Reading Trends</CardTitle>
        <CardDescription>Your reading activity over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </CardContent>
    </Card>
  ),
  ssr: false,
})

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

interface DashboardProps {
  totalBooks: number
  completedBooks: number
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
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  
  // Use router.refresh() instead of window.location.reload() for faster refresh
  const refreshData = () => {
    router.refresh()
  }

  const editingLog = editingLogId ? recentLogs.find(log => log.id === editingLogId) : null

  // Memoize date calculations to avoid recalculating on every render
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
          <p className="text-sm md:text-base text-muted-foreground">Welcome back, {userName}!</p>
        </div>
        <div className="flex-shrink-0">
          <LogReadingForm books={books} onLogAdded={refreshData} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Reading Streak</CardTitle>
            <CardDescription className="text-xs md:text-sm">Consecutive days reading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
              <div className="text-2xl md:text-3xl font-bold">{readingStreak}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Total Books</CardTitle>
            <CardDescription className="text-xs md:text-sm">Books tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{totalBooks}</div>
            {completedBooks > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {completedBooks} completed
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Total Pages</CardTitle>
            <CardDescription className="text-xs md:text-sm">All-time pages read</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{totalPagesRead.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Today's Reading</CardTitle>
            <CardDescription className="text-xs md:text-sm">Pages read today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{todayPages}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">This Week</CardTitle>
            <CardDescription className="text-xs md:text-sm">Pages read this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{weeklyPages}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {daysReadThisWeek} days active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">This Month</CardTitle>
            <CardDescription className="text-xs md:text-sm">Pages read this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{monthlyPages}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {daysReadThisMonth} days active
            </p>
          </CardContent>
        </Card>
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

      <div className="grid gap-4 md:grid-cols-2">
        <ReadingTrendsChartLazy trends={readingTrends} />
        <ReadingSessionTimer books={books} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest reading logs</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-muted-foreground">
              No reading logs yet. Start by adding a book and logging your
              reading!
            </p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div className="flex-1">
                    <p className="font-medium">{log.book.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">{log.pagesRead} pages</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingLogId(log.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {editingLog && (
            <EditReadingLogForm
              log={editingLog}
              open={editingLogId !== null}
              onOpenChange={(open) => {
                if (!open) {
                  setEditingLogId(null)
                }
              }}
              onLogUpdated={refreshData}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

