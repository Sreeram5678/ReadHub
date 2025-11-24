import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

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
    const { type, target, period, startDate, endDate } = body

    const goal = await db.readingGoal.findUnique({
      where: { id },
    })

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    const updatedGoal = await db.readingGoal.update({
      where: { id },
      data: {
        type: type || goal.type,
        target: target !== undefined ? parseInt(target) : goal.target,
        period: period || goal.period,
        startDate: startDate ? new Date(startDate) : goal.startDate,
        endDate: endDate ? new Date(endDate) : goal.endDate,
      },
    })

    return NextResponse.json(updatedGoal)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update reading goal" },
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

    const goal = await db.readingGoal.findUnique({
      where: { id },
    })

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    await db.readingGoal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete reading goal" },
      { status: 500 }
    )
  }
}

