export function calculateWordsPerMinute(wordsRead: number, durationSeconds: number): number {
  if (durationSeconds === 0) return 0
  const minutes = durationSeconds / 60
  return Math.round(wordsRead / minutes)
}

export function calculatePagesPerHour(wordsPerMinute: number, wordsPerPage: number = 250): number {
  return Math.round((wordsPerMinute * 60) / wordsPerPage)
}

export function estimateTimeToFinish(
  remainingPages: number,
  averagePagesPerHour: number
): number {
  if (averagePagesPerHour === 0) return 0
  return Math.round((remainingPages / averagePagesPerHour) * 10) / 10 // Round to 1 decimal
}

export function formatTimeEstimate(hours: number): string {
  if (hours === 0) return "Unknown"
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`
  }
  if (hours < 24) {
    return `${hours.toFixed(1)} hour${hours !== 1 ? "s" : ""}`
  }
  const days = Math.round(hours / 24 * 10) / 10
  return `${days} day${days !== 1 ? "s" : ""}`
}

