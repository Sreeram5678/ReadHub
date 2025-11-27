import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { clearUserTimezoneCache } from "@/lib/user-timezone"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      console.error("User not found for ID:", session.user.id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { password, emailVerified, ...userData } = user as any

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      bio: userData.bio || null,
      timezone: userData.timezone || "Asia/Kolkata",
      createdAt: userData.createdAt,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { 
        error: "Failed to fetch profile",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
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
    const { name, bio, timezone } = body

    // Validate timezone if provided
    if (timezone && typeof timezone !== "string") {
      return NextResponse.json(
        { error: "Invalid timezone format" },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: {
      name?: string
      bio?: string
      timezone?: string
    } = {}

    if (name !== undefined) {
      updateData.name = name || null
    }

    if (bio !== undefined) {
      updateData.bio = bio || null
    }

    if (timezone !== undefined && timezone) {
      updateData.timezone = timezone
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    const { password, emailVerified, ...userData } = updatedUser as any

    // Clear timezone cache for this user
    if (timezone) {
      clearUserTimezoneCache(session.user.id)
    }

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      bio: userData.bio || null,
      timezone: userData.timezone || "Asia/Kolkata",
      createdAt: userData.createdAt,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

