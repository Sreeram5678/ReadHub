import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await db.readingSession.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
      take: 50,
    })

    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reading sessions" },
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
    const { bookId, startTime, endTime, pagesRead, duration } = body

    if (!startTime) {
      return NextResponse.json(
        { error: "Start time is required" },
        { status: 400 }
      )
    }

    if (bookId) {
      const book = await db.book.findUnique({
        where: { id: bookId },
      })

      if (!book || book.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Book not found" },
          { status: 404 }
        )
      }
    }

    const sessionData: any = {
      userId: session.user.id,
      startTime: new Date(startTime),
      pagesRead: pagesRead || 0,
    }

    if (bookId) {
      sessionData.bookId = bookId
    }

    if (endTime) {
      sessionData.endTime = new Date(endTime)
    }

    if (duration) {
      sessionData.duration = parseInt(duration)
    }

    const readingSession = await db.readingSession.create({
      data: sessionData,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    })

    return NextResponse.json(readingSession, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create reading session" },
      { status: 500 }
    )
  }
}

