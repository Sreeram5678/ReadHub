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
    const { quoteText, bookId, pageNumber } = body

    if (!quoteText) {
      return NextResponse.json(
        { error: "Quote text is required" },
        { status: 400 }
      )
    }

    const quote = await db.quote.findUnique({
      where: { id },
    })

    if (!quote || quote.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      )
    }

    // Verify book belongs to user if bookId is provided
    if (bookId) {
      const book = await db.book.findUnique({
        where: { id: bookId },
      })

      if (!book || book.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Book not found" },
          { status: 404 }
        )
      }
    }

    const updated = await db.quote.update({
      where: { id },
      data: {
        quoteText,
        bookId: bookId || null,
        pageNumber: pageNumber ? parseInt(pageNumber) : null,
      },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update quote" },
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

    const quote = await db.quote.findUnique({
      where: { id },
    })

    if (!quote || quote.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      )
    }

    await db.quote.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete quote" },
      { status: 500 }
    )
  }
}

