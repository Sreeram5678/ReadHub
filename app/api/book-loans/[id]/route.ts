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
    const { returnedAt } = body

    const loan = await db.bookLoan.findUnique({
      where: { id },
    })

    if (!loan || loan.userId !== session.user.id) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    const updated = await db.bookLoan.update({
      where: { id },
      data: {
        returnedAt: returnedAt ? new Date(returnedAt) : new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update book loan" },
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

    const loan = await db.bookLoan.findUnique({
      where: { id },
    })

    if (!loan || loan.userId !== session.user.id) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    await db.bookLoan.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete book loan" },
      { status: 500 }
    )
  }
}

