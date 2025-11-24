import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all-time"

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

    // Fetch users and their book counts first
    const users = await db.user.findMany({
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
        const where: any = { userId: user.id }
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

