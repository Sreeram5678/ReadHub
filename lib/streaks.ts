import { getTodayInTimezone, formatDateInTimezone } from "./timezone"

export function calculateReadingStreak(logs: { date: Date }[], timezone: string): number {
  if (logs.length === 0) return 0

  const today = getTodayInTimezone(timezone)

  // Get unique dates in the user's timezone
  const uniqueDateStrings = new Set(
    logs.map((log) => formatDateInTimezone(log.date, timezone))
  )

  const sortedDateStrings = Array.from(uniqueDateStrings).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  if (sortedDateStrings.length === 0) return 0

  const todayStr = formatDateInTimezone(today, timezone)
  let streak = 0
  let expectedDate = new Date(today)

  for (const dateStr of sortedDateStrings) {
    // Parse the date string as if it's in the user's timezone
    const [year, month, day] = dateStr.split("-").map(Number)
    const logDate = new Date(Date.UTC(year, month - 1, day))
    
    const expectedStr = formatDateInTimezone(expectedDate, timezone)
    const diffDays = Math.floor(
      (expectedDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (expectedStr === dateStr) {
      streak++
      expectedDate = new Date(expectedDate.getTime() - 24 * 60 * 60 * 1000)
    } else if (diffDays === 1 && streak === 0) {
      // Yesterday
      streak = 1
      expectedDate = new Date(logDate.getTime() - 24 * 60 * 60 * 1000)
    } else {
      break
    }
  }

  return streak
}

export function getReadingDaysInPeriod(
  logs: { date: Date }[],
  days: number,
  timezone: string
): number {
  const today = getTodayInTimezone(timezone)
  const cutoff = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)

  // Get unique dates in the user's timezone within the period
  const uniqueDateStrings = new Set(
    logs
      .filter((log) => {
        return log.date >= cutoff
      })
      .map((log) => formatDateInTimezone(log.date, timezone))
  )

  return uniqueDateStrings.size
}

