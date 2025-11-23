import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get("bookId")

    const where: any = { userId: session.user.id }
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
    const { bookId, pagesRead, date } = body

    if (!bookId || !pagesRead) {
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

    const logDate = date ? new Date(date) : new Date()
    logDate.setHours(0, 0, 0, 0)

    const existingLog = await db.readingLog.findUnique({
      where: {
        userId_bookId_date: {
          userId: session.user.id,
          bookId,
          date: logDate,
        },
      },
    })

    if (existingLog) {
      const newPagesRead = parseInt(pagesRead)
      // Add pages to existing log instead of replacing
      const totalPagesRead = existingLog.pagesRead + newPagesRead
      const pagesDifference = newPagesRead

      const updatedLog = await db.readingLog.update({
        where: { id: existingLog.id },
        data: { pagesRead: totalPagesRead },
      })

      await db.book.update({
        where: { id: bookId },
        data: {
          currentPage: Math.min(
            Math.max(0, book.currentPage + pagesDifference),
            book.totalPages
          ),
        },
      })

      return NextResponse.json(updatedLog)
    }

    const log = await db.readingLog.create({
      data: {
        userId: session.user.id,
        bookId,
        pagesRead: parseInt(pagesRead),
        date: logDate,
      },
    })

    const updatedBook = await db.book.update({
      where: { id: bookId },
      data: {
        currentPage: Math.min(
          book.currentPage + parseInt(pagesRead),
          book.totalPages
        ),
      },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
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

