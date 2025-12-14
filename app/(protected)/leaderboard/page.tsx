import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { LeaderboardPageClient } from "@/components/leaderboard/LeaderboardPageClient"
import { Prisma } from "@prisma/client"
import { getUserTimezone } from "@/lib/user-timezone"
import { getTodayInTimezone } from "@/lib/timezone"

// This page reads session (uses headers/cookies), so force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

async function getLeaderboard(
  period: string,
  userId: string,
  userTimezone: string,
  customStartDate?: Date,
  customEndDate?: Date
) {
  try {
    let startDate: Date | undefined

    switch (period) {
      case "today":
        startDate = getTodayInTimezone(userTimezone)
        break
      case "week":
        const today = getTodayInTimezone(userTimezone)
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        const todayMonth = getTodayInTimezone(userTimezone)
        startDate = new Date(todayMonth.getFullYear(), todayMonth.getMonth(), 1)
        break
      case "last-30-days":
        const thirtyDaysAgo = getTodayInTimezone(userTimezone)
        startDate = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "quarter":
        const quarterStart = getTodayInTimezone(userTimezone)
        const currentMonth = quarterStart.getMonth()
        const quarterMonth = Math.floor(currentMonth / 3) * 3
        startDate = new Date(quarterStart.getFullYear(), quarterMonth, 1)
        break
      case "year":
        const yearStart = getTodayInTimezone(userTimezone)
        startDate = new Date(yearStart.getFullYear(), 0, 1)
        break
      case "custom-range":
        startDate = customStartDate
        if (customEndDate) {
          const endDate = new Date(customEndDate)
          endDate.setHours(23, 59, 59, 999)
        }
        break
      default:
        startDate = undefined
    }

    // Get accepted friendships
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { userId, status: "accepted" },
          { friendId: userId, status: "accepted" },
        ],
      },
    })

    // Get friend IDs (include current user)
    const friendIds = friendships.map((f: { userId: string; friendId: string }) =>
      f.userId === userId ? f.friendId : f.userId
    )
    const userIds = [userId, ...friendIds]

    if (userIds.length === 0) {
      return []
    }

    const where: Prisma.ReadingLogWhereInput = {}
    if (startDate || customEndDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = startDate
      }
      if (customEndDate) {
        const endDate = new Date(customEndDate)
        endDate.setHours(23, 59, 59, 999)
        where.date.lte = endDate
      }
    }

    // Fetch only friends and current user
    const users = await db.user.findMany({
      where: {
        id: { in: userIds },
      },
      include: {
        readingLogs: {
          where,
          select: {
            pagesRead: true,
          },
        },
        _count: {
          select: {
            books: true,
          },
        },
      },
    })

    const leaderboard = users
      .map((user) => {
        const totalPages = user.readingLogs.reduce(
          (sum, log) => sum + (log.pagesRead || 0),
          0
        )
        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          image: user.image,
          totalPages,
          bookCount: user._count.books,
        }
      })
      .filter((user) => {
        // Always include current user, even if they have 0 pages
        if (user.id === userId) {
          return true
        }
        return user.totalPages > 0
      })
      .sort((a, b) => b.totalPages - a.totalPages)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }))

    return leaderboard
  } catch (error) {
    console.error("Error in getLeaderboard:", error)
    return []
  }
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; startDate?: string; endDate?: string }>
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      redirect("/login")
    }

    const params = await searchParams
    const period = params.period || "all-time"
    const customStartDate = params.startDate ? new Date(params.startDate) : undefined
    const customEndDate = params.endDate ? new Date(params.endDate) : undefined
    const userTimezone = await getUserTimezone(session.user.id)
    const leaderboard = await getLeaderboard(period, session.user.id, userTimezone, customStartDate, customEndDate)

    return (
      <LeaderboardPageClient
        initialLeaderboard={leaderboard}
        currentUserId={session.user.id}
        initialPeriod={period}
      />
    )
  } catch (error) {
    console.error("Error loading leaderboard:", error)
    const session = await auth()
    if (!session?.user?.id) {
      redirect("/login")
    }
    return (
      <LeaderboardPageClient
        initialLeaderboard={[]}
        currentUserId={session.user.id}
        initialPeriod="all-time"
      />
    )
  }
}

