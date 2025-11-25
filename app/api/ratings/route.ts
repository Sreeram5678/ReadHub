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

    const ratings = await db.rating.findMany({
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
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(ratings)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
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
    const {
      bookId,
      overallRating,
      plotRating,
      characterRating,
      writingRating,
      pacingRating,
      review,
    } = body

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

    const rating = await db.rating.upsert({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId,
        },
      },
      update: {
        overallRating: overallRating ? parseInt(overallRating) : null,
        plotRating: plotRating ? parseInt(plotRating) : null,
        characterRating: characterRating ? parseInt(characterRating) : null,
        writingRating: writingRating ? parseInt(writingRating) : null,
        pacingRating: pacingRating ? parseInt(pacingRating) : null,
        review: review || null,
      },
      create: {
        userId: session.user.id,
        bookId,
        overallRating: overallRating ? parseInt(overallRating) : null,
        plotRating: plotRating ? parseInt(plotRating) : null,
        characterRating: characterRating ? parseInt(characterRating) : null,
        writingRating: writingRating ? parseInt(writingRating) : null,
        pacingRating: pacingRating ? parseInt(pacingRating) : null,
        review: review || null,
      },
    })

    return NextResponse.json(rating, { status: 201 })
  } catch (error) {
    console.error("Error creating/updating rating:", error)
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    )
  }
}

