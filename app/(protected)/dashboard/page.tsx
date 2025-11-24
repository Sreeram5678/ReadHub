import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardClient } from "@/components/dashboard/DashboardClient"
import { calculateReadingStreak, getReadingDaysInPeriod } from "@/lib/streaks"

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

  const completedBooks = await db.book.count({
    where: { userId, status: "completed" },
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

  const allLogs = await db.readingLog.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "desc" },
  })

  const readingStreak = calculateReadingStreak(allLogs)
  const daysReadThisWeek = getReadingDaysInPeriod(allLogs, 7)
  const daysReadThisMonth = getReadingDaysInPeriod(allLogs, 30)

  const recentLogs = await db.readingLog.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { date: "desc" },
    take: 5,
  })

  const last30DaysLogs = await db.readingLog.findMany({
    where: {
      userId,
      date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      date: true,
      pagesRead: true,
    },
    orderBy: { date: "asc" },
  })

  const readingGoals = await db.readingGoal.findMany({
    where: {
      userId,
      endDate: {
        gte: new Date(),
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const booksForForm = await getBooks(userId)

  return (
    <DashboardClient
      totalBooks={totalBooks}
      completedBooks={completedBooks}
      totalPagesRead={totalPagesRead._sum.pagesRead || 0}
      todayPages={todayPages._sum.pagesRead || 0}
      recentLogs={recentLogs}
      books={booksForForm}
      userName={session.user?.name || session.user?.email || "User"}
      readingStreak={readingStreak}
      daysReadThisWeek={daysReadThisWeek}
      daysReadThisMonth={daysReadThisMonth}
      readingTrends={last30DaysLogs}
      readingGoals={readingGoals}
    />
  )
}

