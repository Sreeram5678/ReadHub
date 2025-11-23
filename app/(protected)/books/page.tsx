import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { BooksPageClient } from "@/components/books/BooksPageClient"

async function getBooks(userId: string) {
  const books = await db.book.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  const booksWithLogs = await Promise.all(
    books.map(async (book) => {
      const logs = await db.readingLog.findMany({
        where: { bookId: book.id },
        select: { pagesRead: true },
      })
      return {
        ...book,
        readingLogs: logs,
      }
    })
  )

  return booksWithLogs
}

export default async function BooksPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const books = await getBooks(session.user.id)

  return <BooksPageClient initialBooks={books} />
}

