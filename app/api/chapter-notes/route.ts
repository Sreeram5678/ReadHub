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

    if (!bookId) {
      return NextResponse.json(
        { error: "Missing bookId" },
        { status: 400 }
      )
    }

    const notes = await db.chapterNote.findMany({
      where: {
        userId: session.user.id,
        bookId,
      },
      orderBy: [
        { chapterNumber: "asc" },
        { pageNumber: "asc" },
        { createdAt: "asc" },
      ],
    })

    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chapter notes" },
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
    const { bookId, chapterNumber, chapterTitle, note, pageNumber } = body

    if (!bookId || !note) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify book belongs to user
    const book = await db.book.findUnique({
      where: { id: bookId },
    })

    if (!book || book.userId !== session.user.id) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const chapterNote = await db.chapterNote.create({
      data: {
        userId: session.user.id,
        bookId,
        chapterNumber: chapterNumber ? parseInt(chapterNumber) : null,
        chapterTitle: chapterTitle || null,
        note,
        pageNumber: pageNumber ? parseInt(pageNumber) : null,
      },
    })

    return NextResponse.json(chapterNote, { status: 201 })
  } catch (error) {
    console.error("Error creating chapter note:", error)
    return NextResponse.json(
      { error: "Failed to save chapter note" },
      { status: 500 }
    )
  }
}

