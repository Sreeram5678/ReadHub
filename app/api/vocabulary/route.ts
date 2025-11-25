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

    const vocab = await db.vocabulary.findMany({
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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(vocab)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vocabulary" },
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
    const { bookId, word, definition, pageNumber, context } = body

    if (!word) {
      return NextResponse.json(
        { error: "Missing word" },
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

    const vocabulary = await db.vocabulary.create({
      data: {
        userId: session.user.id,
        bookId: bookId || null,
        word,
        definition: definition || null,
        pageNumber: pageNumber ? parseInt(pageNumber) : null,
        context: context || null,
      },
    })

    return NextResponse.json(vocabulary, { status: 201 })
  } catch (error) {
    console.error("Error creating vocabulary entry:", error)
    return NextResponse.json(
      { error: "Failed to save vocabulary" },
      { status: 500 }
    )
  }
}

