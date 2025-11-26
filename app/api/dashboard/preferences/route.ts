import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const preference = await db.dashboardPreference.findUnique({
      where: { userId: session.user.id },
    })

    if (!preference) {
      return NextResponse.json({ widgets: null })
    }

    return NextResponse.json({
      widgets: JSON.parse(preference.layoutJson),
    })
  } catch (error) {
    console.error("Error fetching dashboard preferences:", error)
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { widgets } = body

    if (!Array.isArray(widgets)) {
      return NextResponse.json(
        { error: "Invalid widgets format" },
        { status: 400 }
      )
    }

    const layoutJson = JSON.stringify(widgets)

    const preference = await db.dashboardPreference.upsert({
      where: { userId: session.user.id },
      update: {
        layoutJson,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        layoutJson,
      },
    })

    return NextResponse.json({
      widgets: JSON.parse(preference.layoutJson),
    })
  } catch (error) {
    console.error("Error saving dashboard preferences:", error)
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    )
  }
}

