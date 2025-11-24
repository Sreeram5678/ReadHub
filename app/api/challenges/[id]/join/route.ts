import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const challenge = await db.challenge.findUnique({
      where: { id },
    })

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      )
    }

    const now = new Date()
    if (challenge.endDate < now) {
      return NextResponse.json(
        { error: "Challenge has ended" },
        { status: 400 }
      )
    }

    const existing = await db.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId: id,
          userId: session.user.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Already joined this challenge" },
        { status: 400 }
      )
    }

    const participant = await db.challengeParticipant.create({
      data: {
        challengeId: id,
        userId: session.user.id,
        progress: 0,
      },
    })

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to join challenge" },
      { status: 500 }
    )
  }
}

