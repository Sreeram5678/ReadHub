export function calculateReadingStreak(logs: { date: Date }[]): number {
  if (logs.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const uniqueDates = new Set(
    logs.map((log) => {
      const date = new Date(log.date)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
  )

  const sortedDates = Array.from(uniqueDates).sort((a, b) => b - a)

  if (sortedDates.length === 0) return 0

  let streak = 0
  let expectedDate = new Date(today)

  for (const dateTime of sortedDates) {
    const logDate = new Date(dateTime)
    logDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor(
      (expectedDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      streak++
      expectedDate.setDate(expectedDate.getDate() - 1)
    } else if (diffDays === 1 && streak === 0) {
      streak = 1
      expectedDate = new Date(logDate)
      expectedDate.setDate(expectedDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export function getReadingDaysInPeriod(
  logs: { date: Date }[],
  days: number
): number {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)

  const uniqueDates = new Set(
    logs
      .filter((log) => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate > cutoff
      })
      .map((log) => {
        const date = new Date(log.date)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
  )

  return uniqueDates.size
}

