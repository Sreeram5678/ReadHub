import { db } from "./db"

const STREAK_MILESTONES = [10, 25, 50, 100, 250, 500]

export async function checkAndAwardStreakAchievements(userId: string, currentStreak: number) {
  const achievements = []

  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak >= milestone) {
      // Check if achievement already exists
      const existing = await db.achievement.findUnique({
        where: {
          userId_type_milestone: {
            userId,
            type: "streak",
            milestone,
          },
        },
      })

      if (!existing) {
        // Award achievement
        const achievement = await db.achievement.create({
          data: {
            userId,
            type: "streak",
            milestone,
          },
        })
        achievements.push(achievement)
      }
    }
  }

  return achievements
}

export function getMilestoneLabel(milestone: number): string {
  if (milestone >= 500) return "Legendary Reader"
  if (milestone >= 250) return "Master Reader"
  if (milestone >= 100) return "Dedicated Reader"
  if (milestone >= 50) return "Committed Reader"
  if (milestone >= 25) return "Regular Reader"
  return "Getting Started"
}

