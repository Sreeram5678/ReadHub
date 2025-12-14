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

    // Fetch only friends and current user
    const users = await db.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: {
            books: true,
          },
        },
      },
    })

    // Fetch user data with analytics for advanced sorting
    const userData = await Promise.all(
      users.map(async (user) => {
        const where: Prisma.ReadingLogWhereInput = { userId: user.id }
        if (startDate || endDate) {
          where.date = {}
          if (startDate) {
            where.date.gte = startDate
          }
          if (endDate) {
            where.date.lte = endDate
          }
        }

        // Get reading logs for analytics (filtered by period for pages/speed calculations)
        const readingLogs = await db.readingLog.findMany({
          where,
          select: {
            date: true,
            pagesRead: true,
          },
          orderBy: { date: 'desc' },
        })

        // For streak calculation, we need ALL reading logs (not filtered by period)
        // because streaks are about consecutive days regardless of the selected period
        const allReadingLogs = await db.readingLog.findMany({
          where: { userId: user.id },
          select: {
            date: true,
            pagesRead: true,
          },
          orderBy: { date: 'desc' },
        })

        const totalPages = readingLogs.reduce((sum, log) => sum + (log.pagesRead || 0), 0)

        // Get user's timezone for accurate streak calculation
        const userTz = await getUserTimezone(user.id)

        // Calculate the actual period range for consistency calculation
        // Use the selected period's date range, not the range between first and last reading log
        let periodRangeDays = 1
        if (period === "all-time") {
          // For all-time, use the range from first reading log to today
          if (readingLogs.length > 0) {
            const firstLogDate = readingLogs[readingLogs.length - 1].date
            const today = getTodayInTimezone(userTz)
            periodRangeDays = Math.ceil((today.getTime() - firstLogDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
          } else {
            periodRangeDays = 1
          }
        } else {
          // For specific periods, use the actual period range
          const periodEnd = endDate || getTodayInTimezone(userTz)
          const periodStart = startDate || (readingLogs.length > 0 ? readingLogs[readingLogs.length - 1].date : periodEnd)
          periodRangeDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
        }
        // Ensure minimum of 1 day to avoid division by zero
        periodRangeDays = Math.max(periodRangeDays, 1)

        // Calculate additional metrics for sorting
        const readingDays = new Set(readingLogs.map(log => log.date.toDateString())).size
        // Use period range for averageDaily calculation to be fair
        // This prevents someone who reads 100 pages in one day from getting 100 pages/day
        // while someone who reads 10 pages/day for 30 days gets 10 pages/day
        const averageDaily = periodRangeDays > 0 ? totalPages / periodRangeDays : 0

        // Calculate streak using timezone-aware calculation
        const streakData = calculateStreak(allReadingLogs, userTz)
        const currentStreak = streakData.currentStreak
        // Use period range for consistency, not the range between first and last reading log
        const consistency = periodRangeDays > 0 ? (readingDays / periodRangeDays) * 100 : 0

        return {
          userId: user.id,
          totalPages,
          averageDaily,
          currentStreak,
          consistency,
          readingDays,
        }
      })
    )

    const leaderboard = users
      .map((user) => {
        const data = userData.find((ud) => ud.userId === user.id)
        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          image: user.image,
          totalPages: data?.totalPages || 0,
          bookCount: user._count.books,
          averageDaily: data?.averageDaily || 0,
          currentStreak: data?.currentStreak || 0,
          consistency: data?.consistency || 0,
        }
      })
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
          case 'consistency':
            return user.consistency > 0
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
          case 'consistency':
            return b.consistency - a.consistency
          default:
            return b.totalPages - a.totalPages
        }
      })
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

