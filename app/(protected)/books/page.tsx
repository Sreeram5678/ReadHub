import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { BooksPageClient } from "@/components/books/BooksPageClient"

async function getBooks(userId: string) {
  // Fetch books with logs in a single query using include (fixes N+1 problem)
  const books = await db.book.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      readingLogs: {
        select: { pagesRead: true },
      },
    },
  })

  return books
}

export default async function BooksPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const books = await getBooks(session.user.id)

  return <BooksPageClient initialBooks={books} />
}

