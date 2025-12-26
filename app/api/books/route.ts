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
    const status = searchParams.get("status")

    const where: any = { userId: session.user.id }
    if (status) {
      if (status === "not_completed") {
        where.status = { not: "completed" }
      } else {
        where.status = status
      }
    }

    const orderBy: any = status === "tbr"
      ? [{ priority: "asc" }, { createdAt: "desc" }]
      : { createdAt: "desc" }

    // Include readingLogs and ratings to avoid N+1 queries
    const books = await db.book.findMany({
      where,
      orderBy,
      include: {
        readingLogs: {
          select: { pagesRead: true, date: true },
        },
        ratings: {
          where: { userId: session.user.id },
          select: { overallRating: true },
          take: 1,
        },
      },
    })

    // Convert Date objects to strings and include rating
    return NextResponse.json(books.map(book => ({
      ...book,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
      completedAt: book.completedAt?.toISOString() || null,
      readingLogs: book.readingLogs.map(log => ({
        pagesRead: log.pagesRead,
        date: log.date.toISOString(),
      })),
      rating: book.ratings[0]?.overallRating || null,
    })))
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch books" },
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
    const { title, author, totalPages, initialPages, status, priority, seriesName, seriesNumber, dnfReason } = body

    if (!title || !author || !totalPages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // If status is "tbr" and no priority provided, assign the next highest priority
    let finalPriority = priority !== undefined ? parseInt(priority) : null
    if (status === "tbr" && finalPriority === null) {
      const maxPriorityBook = await db.book.findFirst({
        where: { userId: session.user.id, status: "tbr" },
        orderBy: { priority: "desc" },
        select: { priority: true },
      })
      finalPriority = maxPriorityBook?.priority !== null && maxPriorityBook?.priority !== undefined
        ? maxPriorityBook.priority + 1
        : 1
    }

    const book = await db.book.create({
      data: {
        title,
        author,
        totalPages: parseInt(totalPages),
        initialPages: initialPages ? parseInt(initialPages) : 0,
        status: status || "reading",
        priority: finalPriority,
        seriesName: seriesName || null,
        seriesNumber: seriesNumber ? parseInt(seriesNumber) : null,
        dnfReason: dnfReason || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    )
  }
}

