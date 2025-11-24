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
    const userId = session.user.id

    const group = await db.group.findUnique({
      where: { id },
      include: {
        members: true,
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Check if already a member
    const isMember = group.members.some((m) => m.userId === userId)
    if (isMember) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 })
    }

    // If private group, need invite (for now, allow join if they have the link)
    // In future, can add invite system

    await db.groupMember.create({
      data: {
        groupId: id,
        userId: userId,
        role: "member",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining group:", error)
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const userId = session.user.id

    const group = await db.group.findUnique({
      where: { id },
      include: {
        members: true,
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Can't leave if you're the only admin
    const member = group.members.find((m) => m.userId === userId)
    if (!member) {
      return NextResponse.json({ error: "Not a member" }, { status: 400 })
    }

    if (member.role === "admin") {
      const adminCount = group.members.filter((m) => m.role === "admin").length
      if (adminCount === 1) {
        return NextResponse.json(
          { error: "Cannot leave: you are the only admin. Transfer admin role first or delete the group." },
          { status: 400 }
        )
      }
    }

    await db.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: id,
          userId: userId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving group:", error)
    return NextResponse.json({ error: "Failed to leave group" }, { status: 500 })
  }
}

