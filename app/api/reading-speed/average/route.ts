import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { calculatePagesPerHour } from "@/lib/reading-speed"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tests = await db.readingSpeedTest.findMany({
      where: { userId: session.user.id },
      orderBy: { testDate: "desc" },
      take: 10, // Use last 10 tests for average
    })

    if (tests.length === 0) {
      // Default reading speed: 200 WPM = ~48 pages/hour
      return NextResponse.json({
        averageWPM: 200,
        averagePagesPerHour: 48,
        hasTests: false,
      })
    }

    const averageWPM = Math.round(
      tests.reduce((sum, test) => sum + test.wordsPerMinute, 0) / tests.length
    )

    const averagePagesPerHour = calculatePagesPerHour(averageWPM)

    return NextResponse.json({
      averageWPM,
      averagePagesPerHour,
      hasTests: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to calculate average speed" },
      { status: 500 }
    )
  }
}

