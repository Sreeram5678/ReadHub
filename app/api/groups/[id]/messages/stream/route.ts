import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id } = await params

    const group = await db.group.findUnique({
      where: { id },
      include: {
        members: true,
      },
    })

    if (!group) {
      return new Response("Group not found", { status: 404 })
    }

    const isMember = group.members.some((m) => m.userId === session.user.id)
    if (!group.isPublic && !isMember) {
      return new Response("Access denied", { status: 403 })
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let lastMessageId: string | null = null

        const sendEvent = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        // Send initial connection message
        sendEvent({ type: "connected" })

        // Poll for new messages every 2 seconds
        const groupId = id
        const interval = setInterval(async () => {
          try {
            const where: any = {
              groupId: groupId,
            }

            if (lastMessageId) {
              where.id = { gt: lastMessageId }
            }

            const newMessages = await db.groupMessage.findMany({
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
                createdAt: "asc",
              },
              take: 50,
            })

            if (newMessages.length > 0) {
              sendEvent({
                type: "messages",
                messages: newMessages,
              })
              lastMessageId = newMessages[newMessages.length - 1].id
            }

            // Also check for updated/deleted messages
            const updatedMessages = await db.groupMessage.findMany({
              where: {
                groupId: groupId,
                updatedAt: {
                  gt: new Date(Date.now() - 5000), // Messages updated in last 5 seconds
                },
              },
              select: {
                id: true,
                content: true,
                editedAt: true,
              },
            })

            if (updatedMessages.length > 0) {
              sendEvent({
                type: "updates",
                messages: updatedMessages,
              })
            }
          } catch (error) {
            console.error("Error polling messages:", error)
          }
        }, 2000)

        // Cleanup on client disconnect
        request.signal.addEventListener("abort", () => {
          clearInterval(interval)
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error setting up stream:", error)
    return new Response("Internal server error", { status: 500 })
  }
}

