import { db } from "@/lib/db"

export async function calculateChallengeProgress(userId: string, challenge: {
  id: string
  type: string
  startDate: Date
  endDate: Date
}): Promise<number> {
  const challengeStart = new Date(challenge.startDate)
  challengeStart.setHours(0, 0, 0, 0)
  const challengeEnd = new Date(challenge.endDate)
  challengeEnd.setHours(23, 59, 59, 999)

  if (challenge.type === "pages") {
    const logs = await db.readingLog.findMany({
      where: {
        userId,
        date: {
          gte: challengeStart,
          lte: challengeEnd,
        },
      },
    })
    return logs.reduce((sum, log) => sum + log.pagesRead, 0)
  } else if (challenge.type === "books") {
    const completedBooks = await db.book.findMany({
      where: {
        userId,
        status: "completed",
        completedAt: {
          gte: challengeStart,
          lte: challengeEnd,
        },
      },
    })
    return completedBooks.length
  } else if (challenge.type === "yearly") {
    const logs = await db.readingLog.findMany({
      where: {
        userId,
        date: {
          gte: challengeStart,
          lte: challengeEnd,
        },
      },
    })
    return logs.reduce((sum, log) => sum + log.pagesRead, 0)
  } else if (challenge.type === "genre") {
    const completedBooks = await db.book.findMany({
      where: {
        userId,
        status: "completed",
        completedAt: {
          gte: challengeStart,
          lte: challengeEnd,
        },
      },
    })
    return completedBooks.length
  }

  return 0
}

export async function updateChallengeProgress(userId: string) {
  try {
    const activeChallenges = await db.challenge.findMany({
      where: {
        endDate: { gte: new Date() },
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          where: {
            userId,
          },
        },
      },
    })

    for (const challenge of activeChallenges) {
      const participant = challenge.participants[0]
      if (!participant) continue

      const progress = await calculateChallengeProgress(userId, challenge)

      await db.challengeParticipant.update({
        where: {
          id: participant.id,
        },
        data: {
          progress,
        },
      })
    }
  } catch (error) {
    console.error("Error updating challenge progress:", error)
  }
}

