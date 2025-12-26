import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getUserTimezone } from "@/lib/user-timezone"
import { parseDateInTimezone, getTodayInTimezone } from "@/lib/timezone"
import { updateChallengeProgress } from "@/lib/challenges"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get("bookId")

    const where: Prisma.ReadingLogWhereInput = { userId: session.user.id }
    if (bookId) {
      where.bookId = bookId
    }

    const logs = await db.readingLog.findMany({
      where,
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reading logs" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bookId, pagesRead, startPage, endPage, date } = body

    // Calculate pagesRead from startPage/endPage if provided
    let calculatedPagesRead = pagesRead
    if (startPage && endPage) {
      const start = parseInt(startPage)
      const end = parseInt(endPage)
      if (start > 0 && end >= start) {
        calculatedPagesRead = end - start + 1
      }
    }

    if (!bookId || !calculatedPagesRead) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const book = await db.book.findUnique({
      where: { id: bookId },
    })

    if (!book || book.userId !== session.user.id) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const userTimezone = await getUserTimezone(session.user.id)
    const logDate = date
      ? parseDateInTimezone(date, userTimezone)
      : getTodayInTimezone(userTimezone)

    const existingLog = await db.readingLog.findUnique({
      where: {
        userId_bookId_date: {
          userId: session.user.id,
          bookId,
          date: logDate,
        },
      },
    })

    const pagesToLog = parseInt(calculatedPagesRead)
    const newCurrentPage = endPage ? Math.min(parseInt(endPage), book.totalPages) : Math.min(
      book.currentPage + pagesToLog,
      book.totalPages
    )

    if (existingLog) {
      // Add pages to existing log instead of replacing
      const totalPagesRead = existingLog.pagesRead + pagesToLog

      const updatedLog = await db.readingLog.update({
        where: { id: existingLog.id },
        data: { pagesRead: totalPagesRead },
      })

      await db.book.update({
        where: { id: bookId },
        data: {
          currentPage: newCurrentPage,
        },
      })

      await updateChallengeProgress(session.user.id)

      return NextResponse.json(updatedLog)
    }

    const log = await db.readingLog.create({
      data: {
        userId: session.user.id,
        bookId,
        pagesRead: pagesToLog,
        date: logDate,
      },
    })

    const updatedBook = await db.book.update({
      where: { id: bookId },
      data: {
        currentPage: newCurrentPage,
      },
    })

    await updateChallengeProgress(session.user.id)

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Reading log already exists for this date" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create reading log" },
      { status: 500 }
    )
  }
}

