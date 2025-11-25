import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

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
    const { title, author, totalPages, initialPages, status, priority, seriesName, seriesNumber, dnfReason } = body

    const book = await db.book.findUnique({
      where: { id },
    })

    if (!book || book.userId !== session.user.id) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const updateData: Prisma.BookUpdateInput = {}
    if (title !== undefined) updateData.title = title
    if (author !== undefined) updateData.author = author
    if (totalPages !== undefined) updateData.totalPages = parseInt(totalPages)
    if (initialPages !== undefined) updateData.initialPages = parseInt(initialPages)
    if (seriesName !== undefined) updateData.seriesName = seriesName || null
    if (seriesNumber !== undefined) updateData.seriesNumber = seriesNumber ? parseInt(seriesNumber) : null
    if (dnfReason !== undefined) updateData.dnfReason = dnfReason || null
    if (status !== undefined) {
      updateData.status = status
      if (status === "completed" && !book.completedAt) {
        updateData.completedAt = new Date()
      } else if (status !== "completed") {
        updateData.completedAt = null
      }
      
      // Auto-manage priority based on status
      if (status === "tbr" && priority === undefined && book.priority === null) {
        // Moving to TBR without priority: assign next highest
        const maxPriorityBook = await db.book.findFirst({
          where: { userId: session.user.id, status: "tbr", id: { not: id } },
          orderBy: { priority: "desc" },
          select: { priority: true },
        })
        updateData.priority = maxPriorityBook?.priority !== null && maxPriorityBook?.priority !== undefined
          ? maxPriorityBook.priority + 1
          : 1
      } else if (status !== "tbr") {
        // Moving away from TBR: clear priority
        updateData.priority = null
      }
    }
    if (priority !== undefined) {
      updateData.priority = priority === null || priority === "" ? null : parseInt(priority)
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

