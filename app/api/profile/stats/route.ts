import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { calculateReadingStreak, getReadingDaysInPeriod } from "@/lib/streaks"
import { getUserTimezone } from "@/lib/user-timezone"
import { getTodayInTimezone } from "@/lib/timezone"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userTimezone = await getUserTimezone(userId)

    const [
      booksData,
      readingLogsSum,
      todayPages,
      allLogs,
      recentLogs,
      last30DaysLogs,
      readingGoals,
      currentlyReadingBooks,
      achievements,
      quotes,
      completedBooks,
    ] = await Promise.all([
      db.book.findMany({
        where: { userId },
        select: {
          id: true,
          initialPages: true,
          status: true,
        },
      }),
      db.readingLog.aggregate({
        where: { userId },
        _sum: { pagesRead: true },
      }),
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
      db.readingLog.findMany({
        where: {
          userId,
          date: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
        select: { date: true },
        orderBy: { date: "desc" },
      }),
      db.readingLog.findMany({
        where: { userId },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
            },
          },
        },
        orderBy: { date: "desc" },
        take: 10,
      }),
      db.readingLog.findMany({
        where: {
          userId,
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          date: true,
          pagesRead: true,
        },
        orderBy: { date: "asc" },
      }),
      db.readingGoal.findMany({
        where: {
          userId,
          endDate: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.book.findMany({
        where: {
          userId,
          status: "reading",
        },
        select: {
          id: true,
          title: true,
          author: true,
          totalPages: true,
          currentPage: true,
          initialPages: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      db.achievement.findMany({
        where: { userId },
        include: {
          book: {
            select: {
              title: true,
              author: true,
            },
          },
        },
        orderBy: { achievedAt: "desc" },
        take: 10,
      }),
      db.quote.findMany({
        where: { userId },
        include: {
          book: {
            select: {
              title: true,
              author: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.book.findMany({
        where: {
          userId,
          status: "completed",
        },
        select: {
          id: true,
          title: true,
          author: true,
          completedAt: true,
        },
        orderBy: { completedAt: "desc" },
        take: 10,
      }),
    ])

    const totalBooks = booksData.length
    const completedBooksCount = booksData.filter((b) => b.status === "completed").length
    const initialPagesSum = booksData.reduce(
      (sum, book) => sum + (book.initialPages || 0),
      0
    )
    const totalPagesRead =
      (readingLogsSum._sum.pagesRead || 0) + initialPagesSum
    const readingStreak = calculateReadingStreak(allLogs, userTimezone)
    const daysReadThisWeek = getReadingDaysInPeriod(allLogs, 7, userTimezone)
    const daysReadThisMonth = getReadingDaysInPeriod(allLogs, 30, userTimezone)

    const weeklyPages = last30DaysLogs
      .filter((log) => {
        const logDate = new Date(log.date)
        const today = new Date()
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        weekStart.setHours(0, 0, 0, 0)
        return logDate >= weekStart
      })
      .reduce((sum, log) => sum + log.pagesRead, 0)

    const monthlyPages = last30DaysLogs.reduce(
      (sum, log) => sum + log.pagesRead,
      0
    )

    return NextResponse.json({
      totalBooks,
      completedBooks: completedBooksCount,
      totalPagesRead,
      todayPages: todayPages._sum.pagesRead || 0,
      readingStreak,
      daysReadThisWeek,
      daysReadThisMonth,
      weeklyPages,
      monthlyPages,
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        pagesRead: log.pagesRead,
        date: log.date,
        book: log.book,
      })),
      currentlyReading: currentlyReadingBooks,
      readingGoals,
      achievements,
      quotes: quotes.map((quote) => ({
        id: quote.id,
        quoteText: quote.quoteText,
        pageNumber: quote.pageNumber,
        book: quote.book,
        createdAt: quote.createdAt,
      })),
      completedBooksList: completedBooks,
    })
  } catch (error) {
    console.error("Error fetching profile stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile stats" },
      { status: 500 }
    )
  }
}

