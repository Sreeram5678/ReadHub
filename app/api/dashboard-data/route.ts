import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { calculateReadingStreak, getReadingDaysInPeriod } from "@/lib/streaks"
import { getUserTimezone } from "@/lib/user-timezone"
import { getTodayInTimezone } from "@/lib/timezone"
import { NextResponse } from "next/server"

// Use edge runtime for better performance
export const runtime = 'edge'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userTimezone = await getUserTimezone(userId)
    const now = Date.now()
    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

    // Optimize: Combine related queries and reduce database round trips
    const [
      booksData,
      readingStats,
      todayPages,
      streakLogs,
      recentLogs,
      trendLogs,
      readingGoals,
      booksForForm,
    ] = await Promise.all([
      // Fetch books once and calculate counts in memory
      db.book.findMany({
        where: { userId },
        select: {
          id: true,
          initialPages: true,
          status: true,
        },
      }),
      // Combined total pages and recent activity
      db.readingLog.aggregate({
        where: { userId },
        _sum: { pagesRead: true },
      }),
      // Today's pages query
      (async () => {
        const today = getTodayInTimezone(userTimezone)
        return db.readingLog.aggregate({
          where: {
            userId,
            date: { gte: today },
          },
          _sum: { pagesRead: true },
        })
      })(),
      // Optimized streak calculation query - only last 90 days
      db.readingLog.findMany({
        where: {
          userId,
          date: { gte: ninetyDaysAgo },
        },
        select: { date: true },
        orderBy: { date: "desc" },
      }),
      // Recent logs for activity feed
      db.readingLog.findMany({
        where: { userId },
        include: { book: { select: { title: true } } },
        orderBy: { date: "desc" },
        take: 5,
      }),
      // Trend data for charts - last 30 days only
      db.readingLog.findMany({
        where: {
          userId,
          date: { gte: thirtyDaysAgo },
        },
        select: {
          date: true,
          pagesRead: true,
        },
        orderBy: { date: "asc" },
      }),
      // Active reading goals
      db.readingGoal.findMany({
        where: {
          userId,
          endDate: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Books for forms (already cached)
      db.book.findMany({
        where: {
          userId,
          // Exclude completed books from dashboard dropdowns
          status: { not: "completed" },
        },
        select: {
          id: true,
          title: true,
          author: true,
          totalPages: true,
          currentPage: true,
          initialPages: true,
        },
      }),
    ])

    // Calculate counts from fetched data (faster than separate queries)
    const totalBooks = booksData.length
    const completedBooks = booksData.filter(
      (b: { status?: string }) => b.status === "completed"
    ).length
    const completionPercentage = totalBooks > 0
      ? Math.round((completedBooks / totalBooks) * 100)
      : 0
    const initialPagesSum = booksData.reduce(
      (sum: number, book: { initialPages?: number | null }) =>
        sum + (book.initialPages || 0),
      0
    )

    const totalPagesRead =
      (readingStats._sum.pagesRead || 0) + initialPagesSum

    const readingStreak = calculateReadingStreak(streakLogs, userTimezone)
    const daysReadThisWeek = getReadingDaysInPeriod(streakLogs, 7, userTimezone)
    const daysReadThisMonth = getReadingDaysInPeriod(streakLogs, 30, userTimezone)

    const dashboardData = {
      totalBooks,
      completedBooks,
      completionPercentage,
      totalPagesRead,
      todayPages: todayPages._sum.pagesRead || 0,
      recentLogs,
      books: booksForForm,
      userName: session.user?.name || session.user?.email || "User",
      readingStreak,
      daysReadThisWeek,
      daysReadThisMonth,
      readingTrends: trendLogs,
      readingGoals,
    }

    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes on client
      },
    })

  } catch (error) {
    console.error("Dashboard data fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
