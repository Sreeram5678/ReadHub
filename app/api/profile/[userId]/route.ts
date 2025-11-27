import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { calculateReadingStreak } from "@/lib/streaks"
import { getUserTimezone } from "@/lib/user-timezone"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId: targetUserId } = await params
    const currentUserId = session.user.id

    // Check if user exists
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isOwnProfile = targetUserId === currentUserId

    // Check friendship status if viewing another user's profile
    let friendshipStatus = null
    if (!isOwnProfile) {
      const friendship = await db.friendship.findFirst({
        where: {
          OR: [
            { userId: currentUserId, friendId: targetUserId },
            { userId: targetUserId, friendId: currentUserId },
          ],
        },
      })
      friendshipStatus = friendship?.status || "none"
    }

    // Fetch public reading statistics
    const [
      booksData,
      readingLogsSum,
      allLogs,
      achievements,
      completedBooks,
    ] = await Promise.all([
      db.book.findMany({
        where: { userId: targetUserId },
        select: {
          id: true,
          initialPages: true,
          status: true,
        },
      }),
      db.readingLog.aggregate({
        where: { userId: targetUserId },
        _sum: { pagesRead: true },
      }),
      db.readingLog.findMany({
        where: {
          userId: targetUserId,
          date: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
        select: { date: true },
        orderBy: { date: "desc" },
      }),
      db.achievement.findMany({
        where: { userId: targetUserId },
        include: {
          book: {
            select: {
              title: true,
              author: true,
            },
          },
        },
        orderBy: { achievedAt: "desc" },
        take: 10,
      }),
      db.book.findMany({
        where: {
          userId: targetUserId,
          status: "completed",
        },
        select: {
          id: true,
          title: true,
          author: true,
          completedAt: true,
        },
        orderBy: { completedAt: "desc" },
        take: 10,
      }),
    ])

    const userTimezone = await getUserTimezone(targetUserId)
    const totalBooks = booksData.length
    const completedBooksCount = booksData.filter((b) => b.status === "completed").length
    const initialPagesSum = booksData.reduce(
      (sum, book) => sum + (book.initialPages || 0),
      0
    )
    const totalPagesRead =
      (readingLogsSum._sum.pagesRead || 0) + initialPagesSum
    const readingStreak = calculateReadingStreak(allLogs, userTimezone)

    return NextResponse.json({
      user: targetUser,
      isOwnProfile,
      friendshipStatus,
      stats: {
        totalBooks,
        completedBooks: completedBooksCount,
        totalPagesRead,
        readingStreak,
      },
      achievements,
      completedBooks,
    })
  } catch (error) {
    console.error("Error fetching public profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

