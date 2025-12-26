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
    const { word, definition, pageNumber, context } = body

    const vocabulary = await db.vocabulary.findUnique({
      where: { id },
    })

    if (!vocabulary || vocabulary.userId !== session.user.id) {
      return NextResponse.json({ error: "Vocabulary word not found" }, { status: 404 })
    }

    const updated = await db.vocabulary.update({
      where: { id },
      data: {
        word: word || vocabulary.word,
        definition: definition !== undefined ? (definition || null) : vocabulary.definition,
        pageNumber: pageNumber ? parseInt(pageNumber) : vocabulary.pageNumber,
        context: context !== undefined ? (context || null) : vocabulary.context,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating vocabulary:", error)
    return NextResponse.json(
      { error: "Failed to update vocabulary word" },
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

    const vocabulary = await db.vocabulary.findUnique({
      where: { id },
    })

    if (!vocabulary || vocabulary.userId !== session.user.id) {
      return NextResponse.json({ error: "Vocabulary word not found" }, { status: 404 })
    }

    await db.vocabulary.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting vocabulary:", error)
    return NextResponse.json(
      { error: "Failed to delete vocabulary word" },
      { status: 500 }
    )
  }
}

