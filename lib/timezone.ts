/**
 * Timezone utility functions for handling dates in various timezones
 * Uses IANA timezone names (e.g., "Asia/Kolkata", "America/New_York")
 * 
 * All dates are stored as UTC in the database and converted to/from user's timezone
 */

/**
 * Format a UTC date from database as YYYY-MM-DD in the specified timezone
 */
export function formatDateInTimezone(date: Date, timezone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone: timezone })
}

/**
 * Parse a date string (YYYY-MM-DD) assuming it represents a date in the specified timezone
 * Returns a UTC Date object for database storage (represents 00:00:00 in that timezone)
 * 
 * This function finds the UTC time that corresponds to midnight (00:00:00) of the given
 * date in the specified timezone.
 */
export function parseDateInTimezone(dateString: string, timezone: string): Date {
  const [year, month, day] = dateString.split("-").map(Number)
  
  // Strategy: We'll test UTC times and see what date they show as in the target timezone
  // We want to find a UTC time that shows as YYYY-MM-DD 00:00:00 in the timezone
  
  // Start with noon UTC on the target date (midway through the day to avoid DST issues)
  let testUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
  
  // Check what date this shows as in the target timezone
  let testDateStr = formatDateInTimezone(testUtc, timezone)
  let [testYear, testMonth, testDay] = testDateStr.split("-").map(Number)
  
  // If dates don't match, adjust by the difference
  if (testYear !== year || testMonth !== month || testDay !== day) {
    // Calculate days difference
    const targetDate = new Date(Date.UTC(year, month - 1, day))
    const testDate = new Date(Date.UTC(testYear, testMonth - 1, testDay))
    const diffDays = Math.round((targetDate.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24))
    testUtc = new Date(testUtc.getTime() + diffDays * 24 * 60 * 60 * 1000)
  }
  
  // Now we have a UTC time that shows as the correct date in the timezone
  // We need to adjust it so the time shows as 00:00:00 in the timezone
  
  // Get the current time in the timezone for this UTC time
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  })
  
  const timeParts = timeFormatter.formatToParts(testUtc)
  const hours = parseInt(timeParts.find(p => p.type === "hour")!.value || "0")
  const minutes = parseInt(timeParts.find(p => p.type === "minute")!.value || "0")
  const seconds = parseInt(timeParts.find(p => p.type === "second")?.value || "0")
  
  // Calculate milliseconds to subtract to get to midnight in timezone
  const adjustMs = (hours * 3600 + minutes * 60 + seconds) * 1000
  
  // Subtract to get midnight in the timezone
  const midnightUtc = new Date(testUtc.getTime() - adjustMs)
  
  // Verify it's correct
  const verifyDateStr = formatDateInTimezone(midnightUtc, timezone)
  const verifyTimeStr = midnightUtc.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
  
  if (verifyDateStr === dateString && verifyTimeStr === "00:00") {
    return midnightUtc
  }
  
  // If verification failed, try a simpler approach using offset calculation
  // This is a fallback that should work in most cases
  const offsetMs = getTimezoneOffsetMs(midnightUtc, timezone)
  return new Date(midnightUtc.getTime() - offsetMs)
}

/**
 * Get the timezone offset in milliseconds for a timezone at a given date
 */
function getTimezoneOffsetMs(date: Date, timezone: string): number {
  // Create two dates representing the same moment
  const utcString = date.toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  })
  
  const tzString = date.toLocaleString("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  })
  
  // Parse both (this is approximate but works for offset calculation)
  const utcDate = parseLocalDateTime(utcString)
  const tzDate = parseLocalDateTime(tzString)
  
  return tzDate.getTime() - utcDate.getTime()
}

/**
 * Helper to parse a local date-time string
 */
function parseLocalDateTime(dateStr: string): Date {
  // Format: "MM/DD/YYYY, HH:mm:ss"
  const match = dateStr.match(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/)
  if (!match) return new Date()
  
  const [, month, day, year, hour, minute, second] = match.map(Number)
  return new Date(year, month - 1, day, hour, minute, second)
}

/**
 * Get start of today (00:00:00) in the specified timezone, returned as UTC Date for database storage
 */
export function getTodayInTimezone(timezone: string): Date {
  const now = new Date()
  const todayStr = formatDateInTimezone(now, timezone)
  return parseDateInTimezone(todayStr, timezone)
}

/**
 * Get start of day for a given date in the specified timezone
 */
export function getStartOfDayInTimezone(date: Date, timezone: string): Date {
  const dateStr = formatDateInTimezone(date, timezone)
  return parseDateInTimezone(dateStr, timezone)
}

/**
 * Format date for display in the specified timezone with time
 */
export function formatDateTimeInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date)
}

/**
 * Get the timezone offset in hours for a timezone at a given date
 */
export function getTimezoneOffset(date: Date, timezone: string): number {
  return getTimezoneOffsetMs(date, timezone) / (1000 * 60 * 60)
}
