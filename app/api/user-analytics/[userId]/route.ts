import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserTimezone } from "@/lib/user-timezone"
import { formatDateInTimezone } from "@/lib/timezone"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await params

    // Check if the current user is friends with the requested user
    const isFriend = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: userId, status: "accepted" },
          { userId: userId, friendId: session.user.id, status: "accepted" },
        ],
      },
    })

    // Allow access to own profile or friends
    if (session.user.id !== userId && !isFriend) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const userTimezone = await getUserTimezone(userId)

    // Get user's reading logs
    const readingLogs = await db.readingLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: {
        date: true,
        pagesRead: true,
      },
    })

    // Calculate total pages and books
    const totalPages = readingLogs.reduce((sum, log) => sum + (log.pagesRead || 0), 0)

    const totalBooks = await db.book.count({
      where: { userId },
    })

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(readingLogs, userTimezone)

    // Calculate reading patterns
    const readingPatterns = calculateReadingPatterns(readingLogs, userTimezone)

    // Get goals from database for this user
    const now = new Date()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    // Fetch user's reading goals from database
    const userGoals = await db.readingGoal.findMany({
      where: {
        userId,
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Find goals for each period
    const weeklyGoalObj = userGoals.find(g => g.period === 'weekly' && g.type === 'pages')
    const monthlyGoalObj = userGoals.find(g => g.period === 'monthly' && g.type === 'pages')
    const yearlyGoalObj = userGoals.find(g => g.period === 'yearly' && g.type === 'pages')

    // Use actual goals from database, or default values if not set
    const weeklyGoal = weeklyGoalObj?.target || 100
    const monthlyGoal = monthlyGoalObj?.target || 400
    const yearlyGoal = yearlyGoalObj?.target || 4800

    const weeklyProgress = readingLogs
      .filter(log => log.date >= weekStart)
      .reduce((sum, log) => sum + (log.pagesRead || 0), 0)

    const monthlyProgress = readingLogs
      .filter(log => log.date >= monthStart)
      .reduce((sum, log) => sum + (log.pagesRead || 0), 0)

    const yearlyProgress = readingLogs
      .filter(log => log.date >= yearStart)
      .reduce((sum, log) => sum + (log.pagesRead || 0), 0)

    // Get recent activity (last 7 days)
    const recentActivity = readingLogs
      .slice(0, 7)
      .map(log => ({
        date: formatDateInTimezone(log.date, userTimezone),
        pages: log.pagesRead || 0,
        books: 1, // Simplified - could track books per day if needed
      }))

    const analytics = {
      totalPages,
      totalBooks,
      currentStreak,
      longestStreak,
      averageDaily: readingPatterns.averageDaily,
      averageWeekly: readingPatterns.averageWeekly,
      readingDays: readingPatterns.readingDays,
      mostProductiveDay: readingPatterns.mostProductiveDay,
      mostProductiveHour: readingPatterns.mostProductiveHour,
      weeklyGoal,
      monthlyGoal,
      yearlyGoal,
      weeklyProgress,
      monthlyProgress,
      yearlyProgress,
      recentActivity,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Failed to fetch user analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

function calculateStreaks(readingLogs: Array<{ date: Date; pagesRead: number | null }>, userTimezone: string) {
  if (readingLogs.length === 0) return { currentStreak: 0, longestStreak: 0 }

  // Group logs by date in user's timezone
  const dateMap = new Map<string, number>()
  readingLogs.forEach(log => {
    const dateKey = formatDateInTimezone(log.date, userTimezone)
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + (log.pagesRead || 0))
  })

  // Get unique reading dates sorted in descending order
  const readingDates = Array.from(dateMap.keys())
    .filter(date => dateMap.get(date)! > 0)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (readingDates.length === 0) return { currentStreak: 0, longestStreak: 0 }

  // Calculate current streak
  let currentStreak = 0
  const today = formatDateInTimezone(new Date(), userTimezone)
  let checkDate = new Date(today)

  for (let i = 0; i < 365; i++) { // Check up to a year back
    const dateStr = formatDateInTimezone(checkDate, userTimezone)
    if (dateMap.has(dateStr) && dateMap.get(dateStr)! > 0) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1

  for (let i = 1; i < readingDates.length; i++) {
    const prevDate = new Date(readingDates[i - 1])
    const currDate = new Date(readingDates[i])
    const diffTime = prevDate.getTime() - currDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return { currentStreak, longestStreak }
}

function calculateReadingPatterns(readingLogs: Array<{ date: Date; pagesRead: number | null }>, userTimezone: string) {
  if (readingLogs.length === 0) {
    return {
      averageDaily: 0,
      averageWeekly: 0,
      readingDays: 0,
      mostProductiveDay: 'N/A',
      mostProductiveHour: 0,
    }
  }

  // Group by date and calculate totals
  const dateMap = new Map<string, number>()
  const dayOfWeekMap = new Map<number, number>()
  const hourMap = new Map<number, number>()

  readingLogs.forEach(log => {
    const dateKey = formatDateInTimezone(log.date, userTimezone)
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + (log.pagesRead || 0))

    // Track day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = log.date.getDay()
    dayOfWeekMap.set(dayOfWeek, (dayOfWeekMap.get(dayOfWeek) || 0) + (log.pagesRead || 0))

    // Track hour of day
    const hour = log.date.getHours()
    hourMap.set(hour, (hourMap.get(hour) || 0) + (log.pagesRead || 0))
  })

  const readingDays = dateMap.size
  const totalPages = Array.from(dateMap.values()).reduce((sum, pages) => sum + pages, 0)

  // Find most productive day
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  let mostProductiveDay = 'N/A'
  let maxDayPages = 0

  dayOfWeekMap.forEach((pages, dayIndex) => {
    if (pages > maxDayPages) {
      maxDayPages = pages
      mostProductiveDay = dayNames[dayIndex]
    }
  })

  // Find most productive hour
  let mostProductiveHour = 0
  let maxHourPages = 0

  hourMap.forEach((pages, hour) => {
    if (pages > maxHourPages) {
      maxHourPages = pages
      mostProductiveHour = hour
    }
  })

  // Calculate averages
  const totalDays = readingLogs.length > 0 ?
    Math.ceil((readingLogs[0].date.getTime() - readingLogs[readingLogs.length - 1].date.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1

  const averageDaily = totalPages / Math.max(totalDays, 1)
  const averageWeekly = averageDaily * 7

  return {
    averageDaily,
    averageWeekly,
    readingDays,
    mostProductiveDay,
    mostProductiveHour,
  }
}