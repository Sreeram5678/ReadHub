import { getTodayInTimezone, formatDateInTimezone } from "./timezone"

export function calculateReadingStreak(logs: { date: Date }[], timezone: string): number {
  if (logs.length === 0) return 0

  const today = getTodayInTimezone(timezone)
  const todayStr = formatDateInTimezone(today, timezone)

  // Get unique dates in the user's timezone
  const uniqueDateStrings = new Set(
    logs.map((log) => formatDateInTimezone(log.date, timezone))
  )

  const sortedDateStrings = Array.from(uniqueDateStrings).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  if (sortedDateStrings.length === 0) return 0

  // Determine the starting date for streak calculation
  // If today has a log, start from today; otherwise, start from yesterday
  // (Today not having a log doesn't break the streak - the day isn't over yet)
  const hasTodayLog = uniqueDateStrings.has(todayStr)
  let expectedDate: Date
  
  if (hasTodayLog) {
    // Start from today
    expectedDate = new Date(today)
  } else {
    // Today doesn't have a log yet, so start from yesterday
    // The streak continues as long as yesterday (or earlier consecutive days) have logs
    expectedDate = new Date(today.getTime() - 24 * 60 * 60 * 1000) // yesterday
  }

  let streak = 0
  const dateSet = new Set(sortedDateStrings)

  // Count consecutive days going backwards
  while (true) {
    const expectedStr = formatDateInTimezone(expectedDate, timezone)
    
    if (dateSet.has(expectedStr)) {
      // Found the expected date, increment streak and move to previous day
      streak++
      expectedDate = new Date(expectedDate.getTime() - 24 * 60 * 60 * 1000)
    } else {
      // Expected date is not in the logs - streak is broken
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

