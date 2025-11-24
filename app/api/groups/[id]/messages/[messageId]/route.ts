import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messageId } = await params
    const userId = session.user.id

    const message = await (db as any).groupMessage.findUnique({
      where: { id: messageId },
      include: {
        group: {
          include: {
            members: true,
          },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Only message author, admins, or moderators can edit
    const isAuthor = message.userId === userId
    const member = message.group.members.find((m) => m.userId === userId)
    const canEdit = isAuthor || member?.role === "admin" || member?.role === "moderator"

    if (!canEdit) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    const updatedMessage = await (db as any).groupMessage.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        editedAt: new Date(),
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

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error("Error updating message:", error)
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messageId } = await params
    const userId = session.user.id

    const message = await (db as any).groupMessage.findUnique({
      where: { id: messageId },
      include: {
        group: {
          include: {
            members: true,
          },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Only message author, admins, or moderators can delete
    const isAuthor = message.userId === userId
    const member = message.group.members.find((m) => m.userId === userId)
    const canDelete = isAuthor || member?.role === "admin" || member?.role === "moderator"

    if (!canDelete) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    await (db as any).groupMessage.delete({
      where: { id: messageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}

