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
    const active = searchParams.get("active") === "true"

    const where: any = { userId: session.user.id }
    if (bookId) {
      where.bookId = bookId
    }
    if (active) {
      where.returnedAt = null
    }

    const loans = await db.bookLoan.findMany({
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
      orderBy: { loanedAt: "desc" },
    })

    return NextResponse.json(loans)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch book loans" },
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
    const { bookId, borrowerName, borrowerEmail, notes } = body

    if (!bookId || !borrowerName) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const loan = await db.bookLoan.create({
      data: {
        userId: session.user.id,
        bookId,
        borrowerName,
        borrowerEmail: borrowerEmail || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(loan, { status: 201 })
  } catch (error) {
    console.error("Error creating book loan:", error)
    return NextResponse.json(
      { error: "Failed to save book loan" },
      { status: 500 }
    )
  }
}

