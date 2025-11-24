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

    // Build where clause - keep it simple
    const andConditions: any[] = []

    // Visibility filter
    if (userId === currentUserId) {
      // Get groups where user is a member
      andConditions.push({
        members: {
          some: {
            userId: currentUserId,
          },
        },
      })
    } else if (isPublic === "true") {
      andConditions.push({ isPublic: true })
    } else if (isPublic === "false") {
      andConditions.push({
        isPublic: false,
        members: {
          some: {
            userId: currentUserId,
          },
        },
      })
    } else {
      // Default: show public groups OR private groups user is member of
      andConditions.push({
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
      })
    }

    // Add search filter
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { topic: { contains: search, mode: "insensitive" } },
        ],
      })
    }

    // Add topic filter
    if (topic) {
      andConditions.push({ topic: topic })
    }

    const where = andConditions.length === 1 ? andConditions[0] : { AND: andConditions }

    console.log("Fetching groups with where clause:", JSON.stringify(where, null, 2))
    
    const groups = await (db as any).group.findMany({
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
      take: 100,
    })

    // Check if user is member of each group
    const groupsWithMembership = groups.map((group: any) => {
      const isMember = group.members.some((m: any) => m.userId === currentUserId)
      const userRole = group.members.find((m: any) => m.userId === currentUserId)?.role || null
      return {
        ...group,
        isMember,
        userRole,
      }
    })

    console.log(`Found ${groups.length} groups`)
    return NextResponse.json(groupsWithMembership)
  } catch (error: any) {
    console.error("Error fetching groups:", error)
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    })
    return NextResponse.json(
      { 
        error: "Failed to fetch groups",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    )
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

    const group = await (db as any).group.create({
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

