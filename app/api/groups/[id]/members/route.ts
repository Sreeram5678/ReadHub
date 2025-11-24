import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const currentUserId = session.user.id
    const body = await request.json()
    const { userId, role } = body || {}

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const group = await (db as any).group.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const currentMember = group.members.find((m: any) => m.userId === currentUserId)
    if (!currentMember || (currentMember.role !== "admin" && currentMember.role !== "moderator")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    if (group.members.some((m: any) => m.userId === userId)) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 })
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const requestedRole = role || "member"
    const allowedRoles = ["member", "moderator", "admin"]

    if (!allowedRoles.includes(requestedRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    if (requestedRole !== "member" && currentMember.role !== "admin") {
      return NextResponse.json({ error: "Only admins can assign admin/moderator roles" }, { status: 403 })
    }

    const newMember = await (db as any).groupMember.create({
      data: {
        groupId: id,
        userId,
        role: requestedRole,
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

    return NextResponse.json(newMember)
  } catch (error) {
    console.error("Error adding member:", error)
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 })
  }
}


