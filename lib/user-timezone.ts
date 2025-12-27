import { db } from "@/lib/db"
import { cache } from "react"

const DEFAULT_TIMEZONE = "Asia/Kolkata"

/**
 * Get user's timezone preference from database
 * Returns default timezone ("Asia/Kolkata") if not set or user not found
 * Uses React cache() for request-level memoization in Next.js server components
 */
export const getUserTimezone = cache(async (userId: string): Promise<string> => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    })
    
    return user?.timezone || DEFAULT_TIMEZONE
  } catch (error) {
    console.error("Error fetching user timezone:", error)
    return DEFAULT_TIMEZONE
  }
})






