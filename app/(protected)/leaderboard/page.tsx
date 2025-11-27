import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { LeaderboardPageClient } from "@/components/leaderboard/LeaderboardPageClient"
import { Prisma } from "@prisma/client"
import { getUserTimezone } from "@/lib/user-timezone"
import { getTodayInTimezone } from "@/lib/timezone"

async function getLeaderboard(period: string, userId: string, userTimezone: string) {
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
        startDate = new Date(todayMonth)
        startDate.setMonth(startDate.getMonth() - 1)
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
    if (startDate) {
      where.date = { gte: startDate }
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
      .filter((user) => user.totalPages > 0)
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
  searchParams: Promise<{ period?: string }>
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      redirect("/login")
    }

    const params = await searchParams
    const period = params.period || "all-time"
    const userTimezone = await getUserTimezone(session.user.id)
    const leaderboard = await getLeaderboard(period, session.user.id, userTimezone)

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

