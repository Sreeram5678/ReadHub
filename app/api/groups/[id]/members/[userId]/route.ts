import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, userId } = await params
    const currentUserId = session.user.id

    const group = await db.group.findUnique({
      where: { id },
      include: {
        members: true,
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const currentUserMember = group.members.find((m) => m.userId === currentUserId)
    if (!currentUserMember || (currentUserMember.role !== "admin" && currentUserMember.role !== "moderator")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { role, action } = body

    const targetMember = group.members.find((m) => m.userId === userId)
    if (!targetMember) {
      return NextResponse.json({ error: "User is not a member" }, { status: 404 })
    }

    // Can't change own role
    if (userId === currentUserId) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
    }

    // Only admins can promote to admin/moderator
    if ((role === "admin" || role === "moderator") && currentUserMember.role !== "admin") {
      return NextResponse.json({ error: "Only admins can assign admin/moderator roles" }, { status: 403 })
    }

    if (action === "remove") {
      await db.groupMember.delete({
        where: {
          groupId_userId: {
            groupId: id,
            userId: userId,
          },
        },
      })
      return NextResponse.json({ success: true })
    }

    if (role) {
      await db.groupMember.update({
        where: {
          groupId_userId: {
            groupId: id,
            userId: userId,
          },
        },
        data: { role },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

