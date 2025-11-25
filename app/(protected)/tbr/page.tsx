import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { TBRPageClient } from "@/components/books/TBRPageClient"

async function getTBRBooks(userId: string) {
  const books = await db.book.findMany({
    where: { 
      userId,
      status: "tbr"
    },
    orderBy: [
      { priority: "asc" },
      { createdAt: "desc" }
    ],
    include: {
      readingLogs: {
        select: { pagesRead: true },
      },
    },
  })

  return books
}

export default async function TBRPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const books = await getTBRBooks(session.user.id)

  return <TBRPageClient initialBooks={books} />
}

