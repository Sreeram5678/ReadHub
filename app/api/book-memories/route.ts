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

    const memories = await db.bookMemory.findMany({
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
      orderBy: { memoryDate: "desc" },
    })

    return NextResponse.json(memories)
  } catch (error) {
    console.error("Error fetching book memories:", error)
    return NextResponse.json(
      { error: "Failed to fetch book memories" },
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
      location,
      latitude,
      longitude,
      memoryNote,
      lifeEvent,
      memoryDate,
      photoUrl,
    } = body

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
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

    const memory = await db.bookMemory.create({
      data: {
        userId: session.user.id,
        bookId,
        location: location || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        memoryNote: memoryNote || null,
        lifeEvent: lifeEvent || null,
        memoryDate: memoryDate ? new Date(memoryDate) : null,
        photoUrl: photoUrl || null,
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
    })

    return NextResponse.json(memory, { status: 201 })
  } catch (error) {
    console.error("Error creating book memory:", error)
    return NextResponse.json(
      { error: "Failed to create book memory" },
      { status: 500 }
    )
  }
}

