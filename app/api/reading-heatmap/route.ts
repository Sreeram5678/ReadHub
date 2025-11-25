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

    // Group by date and sum pages
    const dateMap = new Map<string, number>()
    logs.forEach((log) => {
      const dateKey = log.date.toISOString().split("T")[0]
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

