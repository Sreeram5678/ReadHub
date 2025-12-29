import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardClient } from "@/components/dashboard/DashboardClient"
import { calculateReadingStreak, getReadingDaysInPeriod } from "@/lib/streaks"
import { cache, Suspense } from "react"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { getUserTimezone } from "@/lib/user-timezone"
import { getTodayInTimezone } from "@/lib/timezone"

// Use ISR with 2 minute revalidation for better performance
export const revalidate = 120;

const now = Date.now()
const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000)
const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

const getBooks = cache(async (userId: string) => {
  return await db.book.findMany({
    where: {
      userId,
      // Only include currently reading books for log forms
      status: "reading",
    },
    select: {
      id: true,
      title: true,
      author: true,
      totalPages: true,
      currentPage: true,
      initialPages: true,
    },
  })
})

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id
  const userTimezone = await getUserTimezone(userId)

  // Optimize: Combine related queries and reduce database round trips
  const [
    booksData,
    readingStats,
    todayPages,
    weeklyPagesData,
    monthlyPagesData,
    streakLogs,
    recentLogs,
    readingGoals,
    booksForForm,
    dashboardPreferences,
  ] = await Promise.all([
    // Fetch books once and calculate counts in memory
    db.book.findMany({
      where: { userId },
      select: {
        id: true,
        initialPages: true,
        status: true,
      },
    }),
    // Combine total pages and recent activity in one query
    db.readingLog.aggregate({
      where: { userId },
      _sum: { pagesRead: true },
    }),
    // Today's pages query
    (async () => {
      const today = getTodayInTimezone(userTimezone)
      return db.readingLog.aggregate({
        where: {
          userId,
          date: { gte: today },
        },
        _sum: { pagesRead: true },
      })
    })(),
    // Weekly pages query
    (async () => {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
      return db.readingLog.aggregate({
        where: {
          userId,
          date: { gte: weekAgo },
        },
        _sum: { pagesRead: true },
      })
    })(),
    // Monthly pages query
    (async () => {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)
      return db.readingLog.aggregate({
        where: {
          userId,
          date: { gte: monthAgo },
        },
        _sum: { pagesRead: true },
      })
    })(),
    // Optimized streak calculation query - only last 90 days
    db.readingLog.findMany({
      where: {
        userId,
        date: { gte: ninetyDaysAgo },
      },
      select: { date: true },
      orderBy: { date: "desc" },
    }),
    // Recent logs for activity feed
    db.readingLog.findMany({
      where: { userId },
      include: { book: { select: { title: true } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
    // Active reading goals
    db.readingGoal.findMany({
      where: {
        userId,
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Books for forms (already cached)
    getBooks(userId),
    // Dashboard preferences - using type assertion for Prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).dashboardPreference?.findUnique({
      where: { userId },
      select: { layoutJson: true },
    }) || null,
  ])

  // Calculate counts from fetched data (faster than separate queries)
  const totalBooks = booksData.length
  const completedBooks = booksData.filter(
    (b: { status?: string }) => b.status === "completed"
  ).length
  const completionPercentage = totalBooks > 0 
    ? Math.round((completedBooks / totalBooks) * 100) 
    : 0
  const initialPagesSum = booksData.reduce(
    (sum: number, book: { initialPages?: number | null }) =>
      sum + (book.initialPages || 0),
    0
  )

  const totalPagesRead =
    (readingStats._sum.pagesRead || 0) + initialPagesSum

  const readingStreak = calculateReadingStreak(streakLogs, userTimezone)
  const daysReadThisWeek = getReadingDaysInPeriod(streakLogs, 7, userTimezone)
  const daysReadThisMonth = getReadingDaysInPeriod(streakLogs, 30, userTimezone)

  // Dashboard preferences are not currently used in this component
  // but keeping the parsing logic for future use
  if (dashboardPreferences?.layoutJson) {
    try {
      const parsed = JSON.parse(dashboardPreferences.layoutJson)
      // TODO: Use parsed preferences when implementing customizable dashboard
      console.log("Dashboard preferences loaded but not yet implemented:", parsed)
    } catch (error) {
      console.error("Failed to parse dashboard preferences JSON, falling back to defaults:", error)
    }
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient
        totalBooks={totalBooks}
        completedBooks={completedBooks}
        completionPercentage={completionPercentage}
        totalPagesRead={totalPagesRead}
        todayPages={todayPages._sum.pagesRead || 0}
        weeklyPages={weeklyPagesData._sum.pagesRead || 0}
        monthlyPages={monthlyPagesData._sum.pagesRead || 0}
        recentLogs={recentLogs}
        books={booksForForm}
        userName={session.user?.name || session.user?.email || "User"}
        readingStreak={readingStreak}
        daysReadThisWeek={daysReadThisWeek}
        daysReadThisMonth={daysReadThisMonth}
        readingGoals={readingGoals}
      />
    </Suspense>
  )
}

