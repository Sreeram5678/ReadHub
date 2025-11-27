"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: string
  className?: string
}

export function StatCard({ label, value, description, icon, trend, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "card-surface flex h-full flex-col gap-3 rounded-[1.5rem] border border-card-border/70 bg-[color:var(--surface)] p-6 shadow-[var(--card-shadow)]",
        className
      )}
    >
      <div className="flex items-center gap-3 text-sm text-muted">
        {icon && <div className="flex size-10 items-center justify-center rounded-2xl border border-card-border/60">{icon}</div>}
        <span className="uppercase tracking-[0.3em]">{label}</span>
      </div>
      <p className="serif-heading text-3xl text-[color:var(--text)]">{value}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      {trend && <p className="text-xs text-[color:var(--accent)]">{trend}</p>}
    </motion.div>
  )
}

