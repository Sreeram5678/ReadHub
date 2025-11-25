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

    const entries = await db.readingJournal.findMany({
      where,
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
    })

    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch journal entries" },
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
    const { bookId, entry, mood, date } = body

    if (!entry) {
      return NextResponse.json(
        { error: "Missing entry text" },
        { status: 400 }
      )
    }

    if (bookId) {
      // Verify book belongs to user
      const book = await db.book.findUnique({
        where: { id: bookId },
      })

      if (!book || book.userId !== session.user.id) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 })
      }
    }

    const journalEntry = await db.readingJournal.create({
      data: {
        userId: session.user.id,
        bookId: bookId || null,
        entry,
        mood: mood || null,
        date: date ? new Date(date) : new Date(),
      },
    })

    return NextResponse.json(journalEntry, { status: 201 })
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return NextResponse.json(
      { error: "Failed to save journal entry" },
      { status: 500 }
    )
  }
}

