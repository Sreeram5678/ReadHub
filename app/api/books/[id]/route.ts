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
    const { title, author, totalPages, initialPages, status } = body

    const book = await db.book.findUnique({
      where: { id },
    })

    if (!book || book.userId !== session.user.id) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (author !== undefined) updateData.author = author
    if (totalPages !== undefined) updateData.totalPages = parseInt(totalPages)
    if (initialPages !== undefined) updateData.initialPages = parseInt(initialPages)
    if (status !== undefined) {
      updateData.status = status
      if (status === "completed" && !book.completedAt) {
        updateData.completedAt = new Date()
      } else if (status !== "completed") {
        updateData.completedAt = null
      }
    }

    const updatedBook = await db.book.update({
      where: { id },
      data: updateData,
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

