import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserTimezone } from "@/lib/user-timezone"
import { getTodayInTimezone } from "@/lib/timezone"
import { calculatePagesPerHour } from "@/lib/reading-speed"
import { estimateTimeToFinish } from "@/lib/reading-speed"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const book = await db.book.findUnique({
      where: { id },
      include: {
        readingLogs: {
          orderBy: { date: "asc" },
        },
        ratings: {
          where: { userId: session.user.id },
          take: 1,
        },
      },
    })

    if (!book || book.userId !== session.user.id) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const userTimezone = await getUserTimezone(session.user.id)
    const today = getTodayInTimezone(userTimezone)

    // Calculate reading statistics
    const readingLogs = book.readingLogs
    const totalPagesRead = book.initialPages + readingLogs.reduce((sum: number, log: { pagesRead: number }) => sum + log.pagesRead, 0)
    const remainingPages = Math.max(0, book.totalPages - totalPagesRead)

    // Calculate days reading
    if (readingLogs.length === 0) {
      return NextResponse.json({
        totalPagesRead,
        remainingPages,
        daysReading: 0,
        averagePagesPerDay: 0,
        readingDays: 0,
        estimatedTimeToFinish: null,
        firstReadDate: null,
        lastReadDate: null,
        totalReadingSessions: 0,
        rating: book.ratings[0] || null,
      })
    }

    const firstReadDate = readingLogs[0].date
    const lastReadDate = readingLogs[readingLogs.length - 1].date
    const daysReading = Math.ceil((today.getTime() - firstReadDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const readingDays = new Set(readingLogs.map((log: { date: Date }) => log.date.toISOString().split('T')[0])).size
    const averagePagesPerDay = daysReading > 0 ? totalPagesRead / daysReading : 0

    // Get reading speed for time estimate
    const speedTests = await db.readingSpeedTest.findMany({
      where: { userId: session.user.id },
      orderBy: { testDate: "desc" },
      take: 10,
    })

    let averagePagesPerHour = 48 // Default
    if (speedTests.length > 0) {
      const averageWPM = speedTests.reduce((sum: number, test: { wordsPerMinute: number }) => sum + test.wordsPerMinute, 0) / speedTests.length
      averagePagesPerHour = calculatePagesPerHour(averageWPM)
    }

    const hoursToFinish = estimateTimeToFinish(remainingPages, averagePagesPerHour)
    const estimatedTimeToFinish = hoursToFinish > 0 ? hoursToFinish : null

    // Count reading sessions
    const readingSessions = await db.readingSession.count({
      where: {
        userId: session.user.id,
        bookId: id,
      },
    })

    return NextResponse.json({
      totalPagesRead,
      remainingPages,
      daysReading,
      averagePagesPerDay: Math.round(averagePagesPerDay * 10) / 10,
      readingDays,
      estimatedTimeToFinish,
      firstReadDate,
      lastReadDate,
      totalReadingSessions: readingSessions,
      rating: book.ratings[0] || null,
    })
  } catch (error) {
    console.error("Error fetching book stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch book statistics" },
      { status: 500 }
    )
  }
}

