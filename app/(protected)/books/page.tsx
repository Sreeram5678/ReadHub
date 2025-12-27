import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { BooksPageClient } from "@/components/books/BooksPageClient"

// Revalidate every 60 seconds to balance freshness with performance
export const revalidate = 60

async function getBooks(userId: string) {
  // Fetch books with logs and ratings in a single query using include (fixes N+1 problem)
  // Limit reading logs to recent ones to reduce payload size
  const books = await db.book.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      readingLogs: {
        select: { pagesRead: true, date: true },
        orderBy: { date: "desc" },
        take: 50, // Limit to 50 most recent logs per book
      },
      ratings: {
        where: { userId },
        select: { overallRating: true },
        take: 1,
      },
    },
  })

  // Convert Date objects to strings for client component
  return books.map(book => ({
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    completedAt: book.completedAt?.toISOString() || null,
    readingLogs: book.readingLogs.map(log => ({
      pagesRead: log.pagesRead,
      date: log.date.toISOString(),
    })),
    rating: book.ratings[0]?.overallRating || null,
  }))
}

export default async function BooksPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const books = await getBooks(session.user.id)

  return <BooksPageClient initialBooks={books} />
}

