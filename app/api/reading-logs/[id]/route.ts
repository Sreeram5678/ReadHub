import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const logId = params.id
    const body = await request.json()
    const { pagesRead, date } = body

    if (!pagesRead) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const existingLog = await db.readingLog.findUnique({
      where: { id: logId },
      include: { book: true },
    })

    if (!existingLog) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 })
    }

    if (existingLog.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const oldPagesRead = existingLog.pagesRead
    const newPagesRead = parseInt(pagesRead)
    const pagesDifference = newPagesRead - oldPagesRead

    const logDate = date ? new Date(date) : existingLog.date
    logDate.setHours(0, 0, 0, 0)

    const updatedLog = await db.readingLog.update({
      where: { id: logId },
      data: {
        pagesRead: newPagesRead,
        date: logDate,
      },
    })

    const book = existingLog.book
    const newCurrentPage = Math.min(
      Math.max(0, book.currentPage + pagesDifference),
      book.totalPages
    )

    await db.book.update({
      where: { id: book.id },
      data: {
        currentPage: newCurrentPage,
      },
    })

    return NextResponse.json(updatedLog)
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Reading log already exists for this date" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update reading log" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const logId = params.id

    const existingLog = await db.readingLog.findUnique({
      where: { id: logId },
      include: { book: true },
    })

    if (!existingLog) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 })
    }

    if (existingLog.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const pagesDifference = -existingLog.pagesRead
    const book = existingLog.book

    await db.readingLog.delete({
      where: { id: logId },
    })

    const newCurrentPage = Math.min(
      Math.max(0, book.currentPage + pagesDifference),
      book.totalPages
    )

    await db.book.update({
      where: { id: book.id },
      data: {
        currentPage: newCurrentPage,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete reading log" },
      { status: 500 }
    )
  }
}

