import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all" // all, my, public, joined

    const now = new Date()

    let where: Prisma.ChallengeWhereInput = {}

    if (filter === "my") {
      where.creatorId = session.user.id
    } else if (filter === "public") {
      where.isPublic = true
      where.endDate = { gte: now }
    } else if (filter === "joined") {
      where.participants = {
        some: {
          userId: session.user.id,
        },
      }
    } else {
      where.OR = [
        { creatorId: session.user.id },
        { isPublic: true, endDate: { gte: now } },
        {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
        },
      ]
    }

    const challenges = await db.challenge.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participants: {
          where: {
            userId: session.user.id,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const challengesWithProgress = challenges.map((challenge) => {
      const userParticipant = challenge.participants[0]
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        target: challenge.target,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        isPublic: challenge.isPublic,
        creator: challenge.creator,
        participantCount: challenge._count.participants,
        userProgress: userParticipant?.progress || 0,
        isJoined: !!userParticipant,
        createdAt: challenge.createdAt,
      }
    })

    return NextResponse.json(challengesWithProgress)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, type, target, startDate, endDate, isPublic } =
      body

    if (!title || !type || !target || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const challenge = await db.challenge.create({
      data: {
        creatorId: session.user.id,
        title,
        description,
        type,
        target: parseInt(target),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isPublic: isPublic !== false,
      },
    })

    await db.challengeParticipant.create({
      data: {
        challengeId: challenge.id,
        userId: session.user.id,
        progress: 0,
      },
    })

    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    )
  }
}

