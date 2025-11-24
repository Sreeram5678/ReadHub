import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "50")
    const cursor = searchParams.get("cursor")

    const group = await db.group.findUnique({
      where: { id: params.id },
      include: {
        members: true,
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const isMember = group.members.some((m) => m.userId === session.user.id)
    if (!group.isPublic && !isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    let where: any = {
      groupId: params.id,
    }

    if (cursor) {
      where.id = { lt: cursor }
    }

    const messages = await db.groupMessage.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        replyTo: {
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
        attachments: true,
        reactions: {
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
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return NextResponse.json(messages.reverse())
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const group = await db.group.findUnique({
      where: { id: params.id },
      include: {
        members: true,
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const isMember = group.members.some((m) => m.userId === session.user.id)
    if (!isMember) {
      return NextResponse.json({ error: "You must be a member to send messages" }, { status: 403 })
    }

    const body = await request.json()
    const { content, replyToId, attachments } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    const message = await db.groupMessage.create({
      data: {
        groupId: params.id,
        userId: session.user.id,
        content: content.trim(),
        replyToId: replyToId || null,
        attachments: attachments
          ? {
              create: attachments.map((att: any) => ({
                type: att.type,
                url: att.url,
                filename: att.filename,
                size: att.size,
              })),
            }
          : undefined,
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
        replyTo: {
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
        attachments: true,
        reactions: {
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
            replies: true,
          },
        },
      },
    })

    // Update group's updatedAt to reflect new message
    await db.group.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}

