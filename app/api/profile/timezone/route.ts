import { auth } from "@/lib/auth"
import { getUserTimezone } from "@/lib/user-timezone"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const timezone = await getUserTimezone(session.user.id)
    return NextResponse.json({ timezone })
  } catch (error) {
    console.error("Error fetching timezone:", error)
    return NextResponse.json(
      { error: "Failed to fetch timezone" },
      { status: 500 }
    )
  }
}

