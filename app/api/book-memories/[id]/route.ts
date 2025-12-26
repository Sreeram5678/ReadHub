import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const memory = await db.bookMemory.findUnique({
      where: { id },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    })

    if (!memory || memory.userId !== session.user.id) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    return NextResponse.json(memory)
  } catch (error) {
    console.error("Error fetching book memory:", error)
    return NextResponse.json(
      { error: "Failed to fetch book memory" },
      { status: 500 }
    )
  }
}

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
    const {
      location,
      latitude,
      longitude,
      memoryNote,
      lifeEvent,
      memoryDate,
      photoUrl,
    } = body

    const memory = await db.bookMemory.findUnique({
      where: { id },
    })

    if (!memory || memory.userId !== session.user.id) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    const updated = await db.bookMemory.update({
      where: { id },
      data: {
        location: location !== undefined ? (location || null) : memory.location,
        latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : memory.latitude,
        longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : memory.longitude,
        memoryNote: memoryNote !== undefined ? (memoryNote || null) : memory.memoryNote,
        lifeEvent: lifeEvent !== undefined ? (lifeEvent || null) : memory.lifeEvent,
        memoryDate: memoryDate !== undefined ? (memoryDate ? new Date(memoryDate) : null) : memory.memoryDate,
        photoUrl: photoUrl !== undefined ? (photoUrl || null) : memory.photoUrl,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating book memory:", error)
    return NextResponse.json(
      { error: "Failed to update book memory" },
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

    const memory = await db.bookMemory.findUnique({
      where: { id },
    })

    if (!memory || memory.userId !== session.user.id) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    await db.bookMemory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting book memory:", error)
    return NextResponse.json(
      { error: "Failed to delete book memory" },
      { status: 500 }
    )
  }
}

