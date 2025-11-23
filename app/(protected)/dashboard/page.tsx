import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardClient } from "@/components/dashboard/DashboardClient"

async function getBooks(userId: string) {
  return await db.book.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      author: true,
    },
  })
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id

  const totalBooks = await db.book.count({
    where: { userId },
  })

  const readingLogsSum = await db.readingLog.aggregate({
    where: { userId },
    _sum: { pagesRead: true },
  })

  const books = await db.book.findMany({
    where: { userId },
  })

  const initialPagesSum = books.reduce(
    (sum, book) => sum + ((book as any).initialPages || 0),
    0
  )

  const totalPagesRead = {
    _sum: {
      pagesRead: (readingLogsSum._sum.pagesRead || 0) + initialPagesSum,
    },
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayPages = await db.readingLog.aggregate({
    where: {
      userId,
      date: {
        gte: today,
      },
    },
    _sum: { pagesRead: true },
  })

  const recentLogs = await db.readingLog.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { date: "desc" },
    take: 5,
  })

  const booksForForm = await getBooks(userId)

  return (
    <DashboardClient
      totalBooks={totalBooks}
      totalPagesRead={totalPagesRead._sum.pagesRead || 0}
      todayPages={todayPages._sum.pagesRead || 0}
      recentLogs={recentLogs}
      books={booksForForm}
      userName={session.user?.name || session.user?.email || "User"}
    />
  )
}

