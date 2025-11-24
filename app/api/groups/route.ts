import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUserId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const isPublic = searchParams.get("isPublic")
    const topic = searchParams.get("topic")
    const userId = searchParams.get("userId") // Get groups user is member of

    let where: any = {}

    if (userId === currentUserId) {
      // Get groups where user is a member
      where = {
        members: {
          some: {
            userId: currentUserId,
          },
        },
      }
    } else if (isPublic === "true") {
      // Get public groups
      where.isPublic = true
    } else if (isPublic === "false") {
      // Get private groups user is member of
      where = {
        isPublic: false,
        members: {
          some: {
            userId: currentUserId,
          },
        },
      }
    } else {
      // Default: show public groups and private groups user is member of
      where = {
        OR: [
          { isPublic: true },
          {
            isPublic: false,
            members: {
              some: {
                userId: currentUserId,
              },
            },
          },
        ],
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { topic: { contains: search, mode: "insensitive" } },
      ]
    }

    if (topic) {
      where.topic = topic
    }

    const groups = await db.group.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
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
        },
        _count: {
          select: {
            messages: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Check if user is member of each group
    const groupsWithMembership = groups.map((group) => {
      const isMember = group.members.some((m) => m.userId === currentUserId)
      const userRole = group.members.find((m) => m.userId === currentUserId)?.role || null
      return {
        ...group,
        isMember,
        userRole,
      }
    })

    return NextResponse.json(groupsWithMembership)
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { name, description, isPublic, topic, image } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    const group = await db.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic !== undefined ? isPublic : true,
        topic: topic?.trim() || null,
        image: image || null,
        creatorId: userId,
        members: {
          create: {
            userId: userId,
            role: "admin",
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
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
        },
        _count: {
          select: {
            messages: true,
            members: true,
          },
        },
      },
    })

    return NextResponse.json({ ...group, isMember: true, userRole: "admin" })
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}

