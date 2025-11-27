"use client"

import { StatCard } from "@/components/ui/StatCard"

interface WeeklyMonthlyWidgetProps {
  weeklyPages: number
  monthlyPages: number
  daysReadThisWeek: number
  daysReadThisMonth: number
}

export function WeeklyMonthlyWidget({
  weeklyPages,
  monthlyPages,
  daysReadThisWeek,
  daysReadThisMonth,
}: WeeklyMonthlyWidgetProps) {
  const entries = [
    {
      label: "This Week",
      value: `${weeklyPages} pages`,
      description: `${daysReadThisWeek} active days`,
    },
    {
      label: "This Month",
      value: `${monthlyPages} pages`,
      description: `${daysReadThisMonth} active days`,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {entries.map((entry) => (
        <StatCard key={entry.label} label={entry.label.toUpperCase()} value={entry.value} description={entry.description} />
      ))}
    </div>
  )
}

