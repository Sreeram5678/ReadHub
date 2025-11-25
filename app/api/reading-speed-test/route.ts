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
      take: 30, // Last 30 tests
    })

    return NextResponse.json(tests)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch speed tests" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { wordsPerMinute, wordsRead, duration } = body

    if (!wordsPerMinute || !wordsRead || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const test = await db.readingSpeedTest.create({
      data: {
        userId: session.user.id,
        wordsPerMinute: parseInt(wordsPerMinute),
        wordsRead: parseInt(wordsRead),
        duration: parseInt(duration),
      },
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save speed test" },
      { status: 500 }
    )
  }
}

