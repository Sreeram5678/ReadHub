"use client"

import { motion } from "framer-motion"
import { BookOpen, CheckCircle2, FileText, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"

interface StatsWidgetProps {
  totalBooks: number
  completedBooks: number
  completionPercentage: number
  totalPagesRead: number
  todayPages: number
}

export function StatsWidget({
  totalBooks,
  completedBooks,
  completionPercentage,
  totalPagesRead,
  todayPages,
}: StatsWidgetProps) {
  const stats = [
    {
      label: "Library",
      value: totalBooks,
      description: `${completedBooks} completed`,
      icon: <BookOpen className="h-4 w-4 text-[color:var(--accent)]" />,
    },
    {
      label: "Completion",
      value: `${completionPercentage}%`,
      description: `${completedBooks} of ${totalBooks} books`,
      icon: <CheckCircle2 className="h-4 w-4 text-[color:var(--accent)]" />,
    },
    {
      label: "All-Time Pages",
      value: totalPagesRead.toLocaleString(),
      description: "Across tracked sessions",
      icon: <FileText className="h-4 w-4 text-[color:var(--accent)]" />,
    },
    {
      label: "Today",
      value: todayPages,
      description: "Pages logged today",
      icon: <TrendingUp className="h-4 w-4 text-[color:var(--accent)]" />,
    },
  ]

  return (
    <motion.div layout className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </motion.div>
  )
}

