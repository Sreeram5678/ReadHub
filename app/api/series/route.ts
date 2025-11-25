import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all books with series
    const books = await db.book.findMany({
      where: {
        userId: session.user.id,
        seriesName: { not: null },
      },
      orderBy: [
        { seriesName: "asc" },
        { seriesNumber: "asc" },
      ],
    })

    // Group by series
    const seriesMap = new Map<string, typeof books>()
    for (const book of books) {
      if (book.seriesName) {
        if (!seriesMap.has(book.seriesName)) {
          seriesMap.set(book.seriesName, [])
        }
        seriesMap.get(book.seriesName)!.push(book)
      }
    }

    // Convert to array format
    const series = Array.from(seriesMap.entries()).map(([name, books]) => ({
      name,
      books: books.sort((a, b) => (a.seriesNumber || 0) - (b.seriesNumber || 0)),
      totalBooks: books.length,
      completedBooks: books.filter(b => b.status === "completed").length,
    }))

    return NextResponse.json(series)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    )
  }
}

