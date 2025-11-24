import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reminders = await db.reminder.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(reminders)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
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
    const { title, message, time, days, isActive } = body

    if (!title || !time || !days) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const reminder = await db.reminder.create({
      data: {
        userId: session.user.id,
        title,
        message,
        time,
        days,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    )
  }
}

