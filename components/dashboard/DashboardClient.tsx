"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogReadingForm } from "@/components/reading/LogReadingForm"

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

interface DashboardProps {
  totalBooks: number
  totalPagesRead: number
  todayPages: number
  recentLogs: ReadingLog[]
  books: Book[]
  userName: string
}

export function DashboardClient({
  totalBooks,
  totalPagesRead,
  todayPages,
  recentLogs,
  books,
  userName,
}: DashboardProps) {
  const refreshData = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}!</p>
        </div>
        <LogReadingForm books={books} onLogAdded={refreshData} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Books</CardTitle>
            <CardDescription>Books you're tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBooks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Pages Read</CardTitle>
            <CardDescription>All-time pages read</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPagesRead}</div>
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

