import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messageId } = await params

    const body = await request.json()
    const { emoji } = body

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 })
    }

    // Check if reaction already exists
    const existingReaction = await db.groupMessageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId: messageId,
          userId: session.user.id,
          emoji,
        },
      },
    })

    if (existingReaction) {
      // Remove reaction if already exists (toggle)
      await db.groupMessageReaction.delete({
        where: {
          messageId_userId_emoji: {
            messageId: messageId,
            userId: session.user.id,
            emoji,
          },
        },
      })
      return NextResponse.json({ success: true, action: "removed" })
    }

    // Add reaction
    await db.groupMessageReaction.create({
      data: {
        messageId: messageId,
        userId: session.user.id,
        emoji,
      },
    })

    return NextResponse.json({ success: true, action: "added" })
  } catch (error) {
    console.error("Error toggling reaction:", error)
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 })
  }
}

