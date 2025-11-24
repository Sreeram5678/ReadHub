import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { userId, status: "accepted" },
          { friendId: userId, status: "accepted" },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    const friends = friendships.map((friendship) => {
      const friend = friendship.userId === userId ? friendship.friend : friendship.user
      return {
        id: friend.id,
        name: friend.name || friend.email,
        email: friend.email,
        image: friend.image,
        friendshipId: friendship.id,
      }
    })

    const pendingRequests = await db.friendship.findMany({
      where: {
        friendId: userId,
        status: "pending",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({
      friends,
      pendingRequests: pendingRequests.map((req) => ({
        id: req.user.id,
        name: req.user.name || req.user.email,
        email: req.user.email,
        image: req.user.image,
        friendshipId: req.id,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch friends" },
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
    const { friendId, action } = body

    if (!friendId) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 }
      )
    }

    if (friendId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot add yourself as a friend" },
        { status: 400 }
      )
    }

    if (action === "send") {
      const existing = await db.friendship.findFirst({
        where: {
          OR: [
            { userId: session.user.id, friendId },
            { userId: friendId, friendId: session.user.id },
          ],
        },
      })

      if (existing) {
        if (existing.status === "accepted") {
          return NextResponse.json(
            { error: "Already friends" },
            { status: 400 }
          )
        }
        if (existing.status === "pending" && existing.userId === session.user.id) {
          return NextResponse.json(
            { error: "Friend request already sent" },
            { status: 400 }
          )
        }
      }

      const friendship = await db.friendship.create({
        data: {
          userId: session.user.id,
          friendId,
          status: "pending",
        },
      })

      return NextResponse.json(friendship, { status: 201 })
    }

    if (action === "accept") {
      const friendship = await db.friendship.findFirst({
        where: {
          userId: friendId,
          friendId: session.user.id,
          status: "pending",
        },
      })

      if (!friendship) {
        return NextResponse.json(
          { error: "Friend request not found" },
          { status: 404 }
        )
      }

      const updated = await db.friendship.update({
        where: { id: friendship.id },
        data: { status: "accepted" },
      })

      return NextResponse.json(updated)
    }

    if (action === "reject" || action === "remove") {
      const friendship = await db.friendship.findFirst({
        where: {
          OR: [
            { userId: session.user.id, friendId },
            { userId: friendId, friendId: session.user.id },
          ],
        },
      })

      if (!friendship) {
        return NextResponse.json(
          { error: "Friendship not found" },
          { status: 404 }
        )
      }

      await db.friendship.delete({
        where: { id: friendship.id },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process friend request" },
      { status: 500 }
    )
  }
}

