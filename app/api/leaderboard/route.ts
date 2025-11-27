import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getUserTimezone } from "@/lib/user-timezone"
import { getTodayInTimezone, getStartOfDayInTimezone } from "@/lib/timezone"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all-time"
    const userId = session.user.id
    const userTimezone = await getUserTimezone(userId)

    let startDate: Date | undefined
    const now = new Date()

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

    // Fetch only friends and current user
    const users = await db.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: {
            books: true,
          },
        },
      },
    })

    // Fetch aggregated page counts in parallel for better performance
    const userPageCounts = await Promise.all(
      users.map(async (user) => {
        const where: Prisma.ReadingLogWhereInput = { userId: user.id }
        if (startDate) {
          where.date = { gte: startDate }
        }

        const result = await db.readingLog.aggregate({
          where,
          _sum: { pagesRead: true },
        })

        return {
          userId: user.id,
          totalPages: result._sum.pagesRead || 0,
        }
      })
    )

    const leaderboard = users
      .map((user) => {
        const pageCount = userPageCounts.find((pc) => pc.userId === user.id)
        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          image: user.image,
          totalPages: pageCount?.totalPages || 0,
          bookCount: user._count.books,
        }
      })
      .filter((user) => user.totalPages > 0)
      .sort((a, b) => b.totalPages - a.totalPages)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    )
  }
}

