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
    const { entry, mood, date } = body

    const journalEntry = await db.readingJournal.findUnique({
      where: { id },
    })

    if (!journalEntry || journalEntry.userId !== session.user.id) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    const updated = await db.readingJournal.update({
      where: { id },
      data: {
        entry: entry || journalEntry.entry,
        mood: mood !== undefined ? (mood || null) : journalEntry.mood,
        date: date ? new Date(date) : journalEntry.date,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return NextResponse.json(
      { error: "Failed to update journal entry" },
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

    const journalEntry = await db.readingJournal.findUnique({
      where: { id },
    })

    if (!journalEntry || journalEntry.userId !== session.user.id) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    await db.readingJournal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    return NextResponse.json(
      { error: "Failed to delete journal entry" },
      { status: 500 }
    )
  }
}

