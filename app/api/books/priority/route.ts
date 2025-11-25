import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bookId, newPriority } = body

    if (!bookId || newPriority === undefined) {
      return NextResponse.json(
        { error: "Missing bookId or newPriority" },
        { status: 400 }
      )
    }

    const book = await db.book.findUnique({
      where: { id: bookId },
    })

    if (!book || book.userId !== session.user.id) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    if (book.status !== "tbr") {
      return NextResponse.json(
        { error: "Priority can only be set for TBR books" },
        { status: 400 }
      )
    }

    // Get all TBR books for this user, sorted by priority
    const tbrBooks = await db.book.findMany({
      where: {
        userId: session.user.id,
        status: "tbr",
      },
      orderBy: { priority: "asc" },
      select: { id: true, priority: true },
    })

    const oldPriority = book.priority
    const targetPriority = parseInt(newPriority)

    // Reorder priorities
    if (oldPriority !== null && oldPriority !== undefined) {
      if (targetPriority < oldPriority) {
        // Moving up: increment priorities of books between target and old
        await db.book.updateMany({
          where: {
            userId: session.user.id,
            status: "tbr",
            priority: {
              gte: targetPriority,
              lt: oldPriority,
            },
          },
          data: {
            priority: { increment: 1 },
          },
        })
      } else if (targetPriority > oldPriority) {
        // Moving down: decrement priorities of books between old and target
        await db.book.updateMany({
          where: {
            userId: session.user.id,
            status: "tbr",
            priority: {
              gt: oldPriority,
              lte: targetPriority,
            },
          },
          data: {
            priority: { decrement: 1 },
          },
        })
      }
    }

    // Update the book's priority
    const updatedBook = await db.book.update({
      where: { id: bookId },
      data: { priority: targetPriority },
    })

    return NextResponse.json(updatedBook)
  } catch (error) {
    console.error("Error updating priority:", error)
    return NextResponse.json(
      { error: "Failed to update priority" },
      { status: 500 }
    )
  }
}

