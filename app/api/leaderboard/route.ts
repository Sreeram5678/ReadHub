import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getUserTimezone } from "@/lib/user-timezone"
import { getTodayInTimezone, getStartOfDayInTimezone } from "@/lib/timezone"

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

        // Get reading logs for analytics
        const readingLogs = await db.readingLog.findMany({
          where,
          select: {
            date: true,
            pagesRead: true,
          },
          orderBy: { date: 'desc' },
        })

        const totalPages = readingLogs.reduce((sum, log) => sum + (log.pagesRead || 0), 0)

        // Calculate additional metrics for sorting
        const readingDays = new Set(readingLogs.map(log => log.date.toDateString())).size
        const dateRange = readingLogs.length > 0 ?
          (readingLogs[0].date.getTime() - readingLogs[readingLogs.length - 1].date.getTime()) / (1000 * 60 * 60 * 24) + 1 : 1
        const averageDaily = dateRange > 0 ? totalPages / dateRange : 0

        // Calculate streak (simplified version)
        const streakData = calculateStreak(readingLogs)
        const currentStreak = streakData.currentStreak
        const consistency = dateRange > 0 ? (readingDays / dateRange) * 100 : 0

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

function calculateStreak(readingLogs: Array<{ date: Date; pagesRead: number | null }>) {
  if (readingLogs.length === 0) return { currentStreak: 0, longestStreak: 0 }

  // Sort logs by date descending
  const sortedLogs = readingLogs.sort((a, b) => b.date.getTime() - a.date.getTime())

  // Group by date and check for consecutive days
  const readingDates = new Set(
    sortedLogs
      .filter(log => (log.pagesRead || 0) > 0)
      .map(log => log.date.toDateString())
  )

  if (readingDates.size === 0) return { currentStreak: 0, longestStreak: 0 }

  // Calculate current streak
  let currentStreak = 0
  const today = new Date().toDateString()
  let checkDate = new Date(today)

  for (let i = 0; i < 365; i++) { // Check up to a year back
    const dateStr = checkDate.toDateString()
    if (readingDates.has(dateStr)) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  // Calculate longest streak
  const dateArray = Array.from(readingDates).sort()
  let longestStreak = 1
  let tempStreak = 1

  for (let i = 1; i < dateArray.length; i++) {
    const prevDate = new Date(dateArray[i - 1])
    const currDate = new Date(dateArray[i])
    const diffTime = currDate.getTime() - prevDate.getTime()
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

