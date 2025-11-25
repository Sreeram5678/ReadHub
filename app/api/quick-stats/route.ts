import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { calculateReadingStreak } from "@/lib/streaks"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const [booksData, readingLogsSum, allLogs] = await Promise.all([
      db.book.findMany({
        where: { userId },
        select: {
          initialPages: true,
        },
      }),
      db.readingLog.aggregate({
        where: { userId },
        _sum: { pagesRead: true },
      }),
      db.readingLog.findMany({
        where: {
          userId,
          date: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
        select: { date: true },
      }),
    ])

    const totalBooks = booksData.length
    const initialPagesSum = booksData.reduce(
      (sum, book) => sum + (book.initialPages || 0),
      0
    )
    const totalPagesRead =
      (readingLogsSum._sum.pagesRead || 0) + initialPagesSum
    const readingStreak = calculateReadingStreak(allLogs)

    const statsText = `${totalBooks} book${totalBooks !== 1 ? "s" : ""}, ${totalPagesRead.toLocaleString()} pages, ${readingStreak}-day streak`

    return NextResponse.json({
      text: statsText,
      totalBooks,
      totalPagesRead,
      readingStreak,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}

