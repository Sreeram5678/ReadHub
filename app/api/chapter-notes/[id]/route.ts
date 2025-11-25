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
    const { chapterNumber, chapterTitle, note, pageNumber } = body

    const chapterNote = await db.chapterNote.findUnique({
      where: { id },
    })

    if (!chapterNote || chapterNote.userId !== session.user.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    const updated = await db.chapterNote.update({
      where: { id },
      data: {
        chapterNumber: chapterNumber !== undefined ? (chapterNumber ? parseInt(chapterNumber) : null) : undefined,
        chapterTitle: chapterTitle !== undefined ? chapterTitle : undefined,
        note: note !== undefined ? note : undefined,
        pageNumber: pageNumber !== undefined ? (pageNumber ? parseInt(pageNumber) : null) : undefined,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update chapter note" },
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

    const chapterNote = await db.chapterNote.findUnique({
      where: { id },
    })

    if (!chapterNote || chapterNote.userId !== session.user.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    await db.chapterNote.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete chapter note" },
      { status: 500 }
    )
  }
}

