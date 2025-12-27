import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserTimezone } from "@/lib/user-timezone"
import { getTodayInTimezone } from "@/lib/timezone"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // days
    const userIdParam = searchParams.get("userId")

    // Use provided userId if available (for viewing other users' trends), otherwise use current user
    const targetUserId = userIdParam || session.user.id

    // If viewing another user, check if they're friends
    if (userIdParam && userIdParam !== session.user.id) {
      const isFriend = await db.friendship.findFirst({
        where: {
          OR: [
            { userId: session.user.id, friendId: userIdParam, status: "accepted" },
            { userId: userIdParam, friendId: session.user.id, status: "accepted" },
          ],
        },
      })
      if (!isFriend) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
    }

    const userTimezone = await getUserTimezone(targetUserId)

    // Calculate date range
    const daysBack = period === "all" ? 365 : parseInt(period)
    const today = getTodayInTimezone(userTimezone)
    const startDate = new Date(today.getTime() - daysBack * 24 * 60 * 60 * 1000)

    const logs = await db.readingLog.findMany({
      where: {
        userId: targetUserId,
        date: {
          gte: startDate,
        },
      },
      select: {
        date: true,
        pagesRead: true,
      },
      orderBy: {
        date: "asc",
      },
    })

    // Group by date and sum pages (similar to original logic)
    const dateMap = new Map<string, number>()
    logs.forEach((log) => {
      const dateKey = log.date.toISOString().split('T')[0] // YYYY-MM-DD format
      const current = dateMap.get(dateKey) || 0
      dateMap.set(dateKey, current + log.pagesRead)
    })

    // Convert to array format expected by ReadingTrendsChart
    const trendsData = Array.from(dateMap.entries())
      .map(([dateStr, pagesRead]) => ({
        date: new Date(dateStr + 'T00:00:00.000Z'), // Convert back to Date object
        pagesRead,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime()) // Ensure chronological order

    return NextResponse.json(trendsData)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reading trends data" },
      { status: 500 }
    )
  }
}
