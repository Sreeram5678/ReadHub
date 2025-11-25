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

    const reads = await db.bookRead.findMany({
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
      orderBy: { readNumber: "asc" },
    })

    return NextResponse.json(reads)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch book reads" },
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
    const { bookId, startedAt, completedAt, rating, notes } = body

    if (!bookId) {
      return NextResponse.json(
        { error: "Missing bookId" },
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

    // Get the next read number
    const lastRead = await db.bookRead.findFirst({
      where: {
        userId: session.user.id,
        bookId,
      },
      orderBy: { readNumber: "desc" },
    })

    const readNumber = lastRead ? lastRead.readNumber + 1 : 1

    const bookRead = await db.bookRead.create({
      data: {
        userId: session.user.id,
        bookId,
        readNumber,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        completedAt: completedAt ? new Date(completedAt) : null,
        rating: rating ? parseInt(rating) : null,
        notes: notes || null,
      },
    })

    return NextResponse.json(bookRead, { status: 201 })
  } catch (error) {
    console.error("Error creating book read:", error)
    return NextResponse.json(
      { error: "Failed to save book read" },
      { status: 500 }
    )
  }
}

