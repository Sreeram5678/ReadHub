import { db } from "@/lib/db"

const DEFAULT_TIMEZONE = "Asia/Kolkata"

// Simple in-memory cache for timezone lookups (cleared on each request in Next.js)
// For production, consider using Redis or similar for cross-request caching
const timezoneCache = new Map<string, string>()

/**
 * Get user's timezone preference from database
 * Returns default timezone ("Asia/Kolkata") if not set or user not found
 */
export async function getUserTimezone(userId: string): Promise<string> {
  // Check cache first
  if (timezoneCache.has(userId)) {
    return timezoneCache.get(userId)!
  }
  
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    })
    
    const timezone = user?.timezone || DEFAULT_TIMEZONE
    timezoneCache.set(userId, timezone)
    return timezone
  } catch (error) {
    console.error("Error fetching user timezone:", error)
    return DEFAULT_TIMEZONE
  }
}

/**
 * Clear timezone cache for a user (call after updating timezone)
 */
export function clearUserTimezoneCache(userId: string): void {
  timezoneCache.delete(userId)
}

/**
 * Clear all timezone cache
 */
export function clearAllTimezoneCache(): void {
  timezoneCache.clear()
}






