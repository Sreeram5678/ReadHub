import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, message, time, days, isActive } = body

    const reminder = await db.reminder.findUnique({
      where: { id },
    })

    if (!reminder || reminder.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      )
    }

    const updateData: Prisma.ReminderUpdateInput = {}

    if (title !== undefined) updateData.title = title
    if (message !== undefined) updateData.message = message
    if (time !== undefined) updateData.time = time
    if (days !== undefined) updateData.days = days
    if (isActive !== undefined) updateData.isActive = isActive

    const updated = await db.reminder.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const reminder = await db.reminder.findUnique({
      where: { id },
    })

    if (!reminder || reminder.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      )
    }

    await db.reminder.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    )
  }
}

