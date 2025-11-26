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

    // Ensure the challenge exists and is visible to the current user
    const challenge = await db.challenge.findUnique({
      where: { id },
      include: {
        participants: {
          where: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      )
    }

    // Only allow access if challenge is public, created by user, or user is a participant
    const isCreator = challenge.creatorId === session.user.id
    const isParticipant = challenge.participants.length > 0
    const isPublic = challenge.isPublic

    if (!isCreator && !isParticipant && !isPublic) {
      return NextResponse.json(
        { error: "You do not have access to this challenge" },
        { status: 403 }
      )
    }

    const participants = await db.challengeParticipant.findMany({
      where: { challengeId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    })

    return NextResponse.json(
      participants.map((p) => ({
        id: p.id,
        progress: p.progress,
        joinedAt: p.joinedAt,
        user: p.user,
      }))
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch challenge participants" },
      { status: 500 }
    )
  }
}


