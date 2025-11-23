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

    const where: any = {}
    if (startDate) {
      where.date = { gte: startDate }
    }

    const users = await db.user.findMany({
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

    return NextResponse.json(leaderboard)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    )
  }
}

