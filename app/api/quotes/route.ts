import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const FALLBACK_QUOTES = [
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", book: "George R.R. Martin" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", book: "Dr. Seuss" },
  { text: "Reading is essential for those who seek to rise above the ordinary.", book: "Jim Rohn" },
  { text: "Books are a uniquely portable magic.", book: "Stephen King" },
  { text: "So many books, so little time.", book: "Frank Zappa" },
  { text: "Reading is to the mind what exercise is to the body.", book: "Joseph Addison" },
  { text: "The reading of all good books is like conversation with the finest men of past centuries.", book: "René Descartes" },
  { text: "There is no friend as loyal as a book.", book: "Ernest Hemingway" },
]

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const daily = searchParams.get("daily") === "true"

    if (daily) {
      // Get daily quote (random quote from user's quotes, or fallback)
      const userQuotes = await db.quote.findMany({
        where: { userId: session.user.id },
        include: {
          book: {
            select: {
              title: true,
              author: true,
            },
          },
        },
      })

      if (userQuotes.length > 0) {
        // Use date to get consistent daily quote
        const today = new Date()
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
        const quoteIndex = dayOfYear % userQuotes.length
        const selectedQuote = userQuotes[quoteIndex]

        return NextResponse.json({
          id: selectedQuote.id,
          quoteText: selectedQuote.quoteText,
          bookTitle: selectedQuote.book?.title || null,
          bookAuthor: selectedQuote.book?.author || null,
          pageNumber: selectedQuote.pageNumber,
          bookId: selectedQuote.bookId,
          isUserQuote: true,
        })
      } else {
        // Use fallback quote
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
        const fallbackIndex = dayOfYear % FALLBACK_QUOTES.length
        const fallback = FALLBACK_QUOTES[fallbackIndex]

        return NextResponse.json({
          quoteText: fallback.text,
          bookTitle: null,
          bookAuthor: fallback.book,
          pageNumber: null,
          isUserQuote: false,
        })
      }
    }

    // Get all user quotes
    const quotes = await db.quote.findMany({
      where: { userId: session.user.id },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
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
    const { quoteText, bookId, pageNumber } = body

    if (!quoteText) {
      return NextResponse.json(
        { error: "Quote text is required" },
        { status: 400 }
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

    const quote = await db.quote.create({
      data: {
        userId: session.user.id,
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

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Quote ID is required" },
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

