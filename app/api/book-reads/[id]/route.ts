import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

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

    const bookRead = await db.bookRead.findUnique({
      where: { id },
    })

    if (!bookRead || bookRead.userId !== session.user.id) {
      return NextResponse.json({ error: "Book read not found" }, { status: 404 })
    }

    await db.bookRead.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting book read:", error)
    return NextResponse.json(
      { error: "Failed to delete book read" },
      { status: 500 }
    )
  }
}

