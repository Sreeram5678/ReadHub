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
    const range = searchParams.get("range") || "365" // days

    const where: any = {
      userId: session.user.id,
    }

    if (range !== "all") {
      const days = parseInt(range)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)
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

    // Helper to format a Date as YYYY-MM-DD in the user's local timezone
    const formatLocalDate = (date: Date) => {
      const local = new Date(date)
      local.setHours(0, 0, 0, 0)
      const year = local.getFullYear()
      const month = String(local.getMonth() + 1).padStart(2, "0")
      const day = String(local.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    // Group by local date and sum pages
    const dateMap = new Map<string, number>()
    logs.forEach((log) => {
      const dateKey = formatLocalDate(log.date)
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

