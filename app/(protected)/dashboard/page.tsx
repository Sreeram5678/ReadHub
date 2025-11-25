import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardClient } from "@/components/dashboard/DashboardClient"
import { calculateReadingStreak, getReadingDaysInPeriod } from "@/lib/streaks"
import { cache, Suspense } from "react"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"

const getBooks = cache(async (userId: string) => {
  return await db.book.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      author: true,
    },
  })
})

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id

  // Optimize: Combine book counts and fetch books data in parallel
  const [
    booksData,
    readingLogsSum,
    todayPages,
    allLogs,
    recentLogs,
    last30DaysLogs,
    readingGoals,
    booksForForm,
  ] = await Promise.all([
    // Fetch books once and calculate counts in memory (faster than 2 separate count queries)
    db.book.findMany({
      where: { userId },
      select: { 
        id: true,
        initialPages: true,
        status: true,
      },
    }),
    db.readingLog.aggregate({
      where: { userId },
      _sum: { pagesRead: true },
    }),
    (async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return db.readingLog.aggregate({
        where: {
          userId,
          date: { gte: today },
        },
        _sum: { pagesRead: true },
      })
    })(),
    // Only fetch logs from last 90 days for streak calculation (optimization)
    db.readingLog.findMany({
      where: {
        userId,
        date: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      select: { date: true },
      orderBy: { date: "desc" },
    }),
    db.readingLog.findMany({
      where: { userId },
      include: { book: { select: { title: true } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
    db.readingLog.findMany({
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
    }),
    db.readingGoal.findMany({
      where: {
        userId,
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
    getBooks(userId),
  ])

  // Calculate counts from fetched data (faster than separate queries)
  const totalBooks = booksData.length
  const completedBooks = booksData.filter(b => b.status === "completed").length
  const completionPercentage = totalBooks > 0 
    ? Math.round((completedBooks / totalBooks) * 100) 
    : 0
  const initialPagesSum = booksData.reduce(
    (sum, book) => sum + (book.initialPages || 0),
    0
  )

  const totalPagesRead =
    (readingLogsSum._sum.pagesRead || 0) + initialPagesSum

  const readingStreak = calculateReadingStreak(allLogs)
  const daysReadThisWeek = getReadingDaysInPeriod(allLogs, 7)
  const daysReadThisMonth = getReadingDaysInPeriod(allLogs, 30)

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient
        totalBooks={totalBooks}
        completedBooks={completedBooks}
        completionPercentage={completionPercentage}
        totalPagesRead={totalPagesRead}
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
    </Suspense>
  )
}

