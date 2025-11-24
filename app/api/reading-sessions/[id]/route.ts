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
    const { endTime, pagesRead, duration } = body

    const sessionRecord = await db.readingSession.findUnique({
      where: { id },
    })

    if (!sessionRecord || sessionRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    const updateData: Prisma.ReadingSessionUpdateInput = {}

    if (endTime !== undefined) {
      updateData.endTime = new Date(endTime)
    }

    if (pagesRead !== undefined) {
      updateData.pagesRead = parseInt(pagesRead)
    }

    if (duration !== undefined) {
      updateData.duration = parseInt(duration)
    }

    const updated = await db.readingSession.update({
      where: { id },
      data: updateData,
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
    return NextResponse.json(
      { error: "Failed to update session" },
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

    const sessionRecord = await db.readingSession.findUnique({
      where: { id },
    })

    if (!sessionRecord || sessionRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    await db.readingSession.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    )
  }
}

