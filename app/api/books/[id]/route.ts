import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, author, totalPages, initialPages } = body

    const book = await db.book.findUnique({
      where: { id },
    })

    if (!book || book.userId !== session.user.id) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const updatedBook = await db.book.update({
      where: { id },
      data: {
        title,
        author,
        totalPages: totalPages ? parseInt(totalPages) : undefined,
        initialPages: initialPages !== undefined ? parseInt(initialPages) : undefined,
      },
    })

    return NextResponse.json(updatedBook)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const book = await db.book.findUnique({
      where: { id },
    })

    if (!book || book.userId !== session.user.id) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    await db.book.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    )
  }
}

