import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const books = await db.book.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
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
    const { title, author, totalPages, initialPages } = body

    if (!title || !author || !totalPages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const book = await db.book.create({
      data: {
        title,
        author,
        totalPages: parseInt(totalPages),
        initialPages: initialPages ? parseInt(initialPages) : 0,
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

