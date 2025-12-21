'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardClient } from "@/components/dashboard/DashboardClient"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"

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

interface DashboardData {
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard-data')

        if (response.status === 401) {
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        console.error('Dashboard data fetch error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-red-500 mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Failed to Load Dashboard</h2>
        <p className="text-muted-foreground mb-4">
          {error || 'Unable to fetch your reading data'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <DashboardClient
      totalBooks={data.totalBooks}
      completedBooks={data.completedBooks}
      completionPercentage={data.completionPercentage}
      totalPagesRead={data.totalPagesRead}
      todayPages={data.todayPages}
      recentLogs={data.recentLogs}
      books={data.books}
      userName={data.userName}
      readingStreak={data.readingStreak}
      daysReadThisWeek={data.daysReadThisWeek}
      daysReadThisMonth={data.daysReadThisMonth}
      readingTrends={data.readingTrends}
      readingGoals={data.readingGoals}
    />
  )
}

