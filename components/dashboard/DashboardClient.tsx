"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogReadingForm } from "@/components/reading/LogReadingForm"
import { ReadingGoals } from "./ReadingGoals"
import { ReadingTrendsChart } from "./ReadingTrendsChart"
import { Flame } from "lucide-react"

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
  const refreshData = () => {
    window.location.reload()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const weeklyPages = readingTrends
    .filter((t) => new Date(t.date) >= weekStart)
    .reduce((sum, t) => sum + t.pagesRead, 0)

  const monthlyPages = readingTrends
    .filter((t) => new Date(t.date) >= monthStart)
    .reduce((sum, t) => sum + t.pagesRead, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}!</p>
        </div>
        <LogReadingForm books={books} onLogAdded={refreshData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Reading Streak</CardTitle>
            <CardDescription>Consecutive days reading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div className="text-3xl font-bold">{readingStreak}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Books</CardTitle>
            <CardDescription>Books tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBooks}</div>
            {completedBooks > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {completedBooks} completed
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Pages</CardTitle>
            <CardDescription>All-time pages read</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPagesRead.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today's Reading</CardTitle>
            <CardDescription>Pages read today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayPages}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>Pages read this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyPages}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {daysReadThisWeek} days active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Pages read this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyPages}</div>
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

      <ReadingTrendsChart trends={readingTrends} />

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
                  <div>
                    <p className="font-medium">{log.book.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold">{log.pagesRead} pages</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

