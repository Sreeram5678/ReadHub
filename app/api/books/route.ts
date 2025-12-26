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
      where.status = status
    }

    const orderBy: any = status === "tbr"
      ? [{ priority: "asc" }, { createdAt: "desc" }]
      : { createdAt: "desc" }

    // Include readingLogs to avoid N+1 queries
    const books = await db.book.findMany({
      where,
      orderBy,
      include: {
        readingLogs: {
          select: { pagesRead: true, date: true },
        },
      },
    })

    return NextResponse.json(books)
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

