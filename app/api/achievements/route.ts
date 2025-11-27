import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { checkAndAwardStreakAchievements } from "@/lib/achievements"
import { calculateReadingStreak } from "@/lib/streaks"
import { getUserTimezone } from "@/lib/user-timezone"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const achievements = await db.achievement.findMany({
      where: { userId: session.user.id },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
      orderBy: { achievedAt: "desc" },
    })

    return NextResponse.json(achievements)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current reading streak
    const logs = await db.readingLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      select: { date: true },
    })

    const userTimezone = await getUserTimezone(session.user.id)
    const currentStreak = calculateReadingStreak(logs, userTimezone)

    // Check and award streak achievements
    const newAchievements = await checkAndAwardStreakAchievements(
      session.user.id,
      currentStreak
    )

    return NextResponse.json({
      newAchievements,
      currentStreak,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check achievements" },
      { status: 500 }
    )
  }
}

