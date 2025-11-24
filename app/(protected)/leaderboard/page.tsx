import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { LeaderboardPageClient } from "@/components/leaderboard/LeaderboardPageClient"
import { Prisma } from "@prisma/client"

async function getLeaderboard(period: string, userId: string) {
  let startDate: Date | undefined
  const now = new Date()

  switch (period) {
    case "today":
      startDate = new Date(now)
      startDate.setHours(0, 0, 0, 0)
      break
    case "week":
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
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
        (sum, log) => sum + log.pagesRead,
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
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const params = await searchParams
  const period = params.period || "all-time"
  const leaderboard = await getLeaderboard(period, session.user.id)

  return (
    <LeaderboardPageClient
      initialLeaderboard={leaderboard}
      currentUserId={session.user.id}
      initialPeriod={period}
    />
  )
}

