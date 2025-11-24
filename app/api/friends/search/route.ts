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
    const query = searchParams.get("q") || ""

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const users = await db.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } },
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10,
    })

    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { friendId: session.user.id },
        ],
      },
    })

    const friendIds = new Set(
      friendships.map((f) =>
        f.userId === session.user.id ? f.friendId : f.userId
      )
    )

    const usersWithStatus = users.map((user) => {
      const friendship = friendships.find(
        (f) =>
          (f.userId === session.user.id && f.friendId === user.id) ||
          (f.friendId === session.user.id && f.userId === user.id)
      )

      return {
        ...user,
        status: friendship?.status || "none",
        friendshipId: friendship?.id,
      }
    })

    return NextResponse.json(usersWithStatus)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    )
  }
}

