import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getUserTimezone } from "@/lib/user-timezone"
import { getTodayInTimezone, getStartOfDayInTimezone, formatDateInTimezone } from "@/lib/timezone"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all-time"
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")
    const sortBy = searchParams.get("sortBy") || "pages"
    const userIdsParam = searchParams.get("userIds")
    const userId = session.user.id
    const userTimezone = await getUserTimezone(userId)

    let startDate: Date | undefined
    let endDate: Date | undefined
    const now = new Date()

    switch (period) {
      case "today":
        startDate = getTodayInTimezone(userTimezone)
        break
      case "week":
        const today = getTodayInTimezone(userTimezone)
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        const todayMonth = getTodayInTimezone(userTimezone)
        startDate = new Date(todayMonth.getFullYear(), todayMonth.getMonth(), 1)
        break
      case "last-30-days":
        const thirtyDaysAgo = getTodayInTimezone(userTimezone)
        startDate = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "quarter":
        const quarterStart = getTodayInTimezone(userTimezone)
        const currentMonth = quarterStart.getMonth()
        const quarterMonth = Math.floor(currentMonth / 3) * 3
        startDate = new Date(quarterStart.getFullYear(), quarterMonth, 1)
        break
      case "year":
        const yearStart = getTodayInTimezone(userTimezone)
        startDate = new Date(yearStart.getFullYear(), 0, 1)
        break
      case "custom-range":
        if (startDateParam) {
          startDate = new Date(startDateParam)
        }
        if (endDateParam) {
          endDate = new Date(endDateParam)
          // Set end date to end of day
          endDate.setHours(23, 59, 59, 999)
        }
        break
      default:
        startDate = undefined
    }

    // Get accepted friendships
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { userId, status: "accepted" },
          { friendId: userId, status: "accepted" },
        ],
      },
    })

    // Get friend IDs (include current user)
    const friendIds = friendships.map((f: { userId: string; friendId: string }) =>
      f.userId === userId ? f.friendId : f.userId
    )
    let userIds = [userId, ...friendIds]

    // Filter by selected users if provided
    if (userIdsParam) {
      const selectedUserIds = userIdsParam.split(',').filter(id => userIds.includes(id))
      // Always include current user even if not in selected users
      if (selectedUserIds.length > 0 && !selectedUserIds.includes(userId)) {
        selectedUserIds.push(userId)
      }
      userIds = selectedUserIds.length > 0 ? selectedUserIds : userIds
    }

    // Use raw SQL for better performance on complex leaderboard queries
    const startDateStr = startDate ? startDate.toISOString() : null
    const endDateStr = endDate ? endDate.toISOString() : null

    const leaderboardData = await db.$queryRaw`
      SELECT
        u.id,
        u.name,
        u.email,
        u.image,
        COUNT(DISTINCT b.id) as book_count,
        COALESCE(SUM(CASE
          WHEN ${startDateStr}::timestamp IS NULL OR rl.date >= ${startDateStr}::timestamp
          AND (${endDateStr}::timestamp IS NULL OR rl.date <= ${endDateStr}::timestamp)
          THEN rl.pages_read
          ELSE 0
        END), 0) as total_pages
      FROM "User" u
      LEFT JOIN "Book" b ON b.user_id = u.id
      LEFT JOIN "ReadingLog" rl ON rl.user_id = u.id
        AND (${startDateStr}::timestamp IS NULL OR rl.date >= ${startDateStr}::timestamp)
        AND (${endDateStr}::timestamp IS NULL OR rl.date <= ${endDateStr}::timestamp)
      WHERE u.id = ANY(${userIds})
      GROUP BY u.id, u.name, u.email, u.image
      ORDER BY total_pages DESC
    ` as Array<{
      id: string
      name: string | null
      email: string
      image: string | null
      book_count: bigint
      total_pages: bigint
    }>

    // Get user timezones in a single batch query
    const userTimezones = await Promise.all(
      userIds.map(userId => getUserTimezone(userId))
    )
    const timezoneMap = new Map(userIds.map((id, index) => [id, userTimezones[index]]))

    // Calculate metrics for each user in memory (much faster)
    const userData = await Promise.all(leaderboardData.map(async (user) => {
      const totalPages = Number(user.total_pages)
      const userTz = timezoneMap.get(user.id) || userTimezone

      // For average daily calculation, we need reading day count
      // Use raw SQL to get reading days for the period
      let readingDays = 1
      let averageDaily = totalPages

      if (sortBy === 'speed' || period !== 'all-time') {
        // Only calculate expensive metrics when needed
        const readingDaysResult = await db.$queryRaw`
          SELECT COUNT(DISTINCT DATE(rl.date)) as reading_days
          FROM "ReadingLog" rl
          WHERE rl.user_id = ${user.id}
          AND (${startDateStr}::timestamp IS NULL OR rl.date >= ${startDateStr}::timestamp)
          AND (${endDateStr}::timestamp IS NULL OR rl.date <= ${endDateStr}::timestamp)
        ` as Array<{ reading_days: bigint }>

        readingDays = Number(readingDaysResult[0]?.reading_days || 1)
        averageDaily = readingDays > 0 ? totalPages / readingDays : totalPages
      }

      // Calculate current streak only when sorting by streak
      let currentStreak = 0
      if (sortBy === 'streak') {
        // Get all reading logs for streak calculation
        const allLogs = await db.readingLog.findMany({
          where: { userId: user.id },
          select: { date: true, pagesRead: true },
          orderBy: { date: 'desc' },
        })
        currentStreak = calculateStreakSync(allLogs, userTz)
      }

      return {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        image: user.image,
        totalPages,
        bookCount: Number(user.book_count),
        averageDaily,
        currentStreak,
      }
    }))

    const leaderboard = userData
      .filter((user) => {
        // Always include current user, even if they have 0 pages/metrics
        if (user.id === userId) {
          return true
        }
        // Filter based on sort criteria - only show users with relevant data
        switch (sortBy) {
          case 'pages':
            return user.totalPages > 0
          case 'speed':
            return user.averageDaily > 0
          case 'streak':
            return user.currentStreak > 0
          default:
            return user.totalPages > 0
        }
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'pages':
            return b.totalPages - a.totalPages
          case 'speed':
            return b.averageDaily - a.averageDaily
          case 'streak':
            return b.currentStreak - a.currentStreak
          default:
            return b.totalPages - a.totalPages
        }
      })
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }))

    return NextResponse.json(leaderboard, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    )
  }
}

function calculateStreakSync(readingLogs: Array<{ date: Date; pagesRead: number | null }>, userTimezone: string): number {
  if (readingLogs.length === 0) return 0

  // Group logs by date in user's timezone
  const dateMap = new Map<string, number>()
  readingLogs.forEach(log => {
    const dateKey = formatDateInTimezone(log.date, userTimezone)
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + (log.pagesRead || 0))
  })

  // Calculate current streak using timezone-aware dates
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

  return currentStreak
}

function calculateStreak(readingLogs: Array<{ date: Date; pagesRead: number | null }>, userTimezone: string) {
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

  // Calculate current streak using timezone-aware dates
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
  let longestStreak = 1
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

