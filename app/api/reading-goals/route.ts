import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goals = await db.readingGoal.findMany({
      where: {
        userId: session.user.id,
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(goals)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reading goals" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, target, period, startDate, endDate } = body

    if (!type || !target || !period || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const goal = await db.readingGoal.create({
      data: {
        userId: session.user.id,
        type,
        target: parseInt(target),
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create reading goal" },
      { status: 500 }
    )
  }
}

