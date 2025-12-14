import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserTimezone } from "@/lib/user-timezone"
import { formatDateInTimezone, getTodayInTimezone, getStartOfDayInTimezone } from "@/lib/timezone"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "365" // days
    const userIdParam = searchParams.get("userId")

    // Use provided userId if available (for viewing other users' heatmaps), otherwise use current user
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

    const where: any = {
      userId: targetUserId,
    }

    const userTimezone = await getUserTimezone(targetUserId)
    
    if (range !== "all") {
      const days = parseInt(range)
      const today = getTodayInTimezone(userTimezone)
      const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
      where.date = {
        gte: startDate,
      }
    }

    const logs = await db.readingLog.findMany({
      where,
      select: {
        date: true,
        pagesRead: true,
      },
    })

    // Group by date in user's timezone and sum pages
    const dateMap = new Map<string, number>()
    logs.forEach((log) => {
      const dateKey = formatDateInTimezone(log.date, userTimezone)
      const current = dateMap.get(dateKey) || 0
      dateMap.set(dateKey, current + log.pagesRead)
    })

    // Convert to array format
    const heatmapData = Array.from(dateMap.entries()).map(([date, pages]) => ({
      date,
      pages,
    }))

    return NextResponse.json(heatmapData)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch heatmap data" },
      { status: 500 }
    )
  }
}

