"use client"

import { motion } from "framer-motion"
import { BookMarked, Compass, Sparkles, Users } from "lucide-react"

const features = [
  {
    title: "Calibrated Library",
    description: "Curate books, series, and TBR with elegant, high-fidelity controls.",
    icon: BookMarked,
  },
  {
    title: "Habit Intelligence",
    description: "Advanced streak, pace, and projection analytics keep you consistent.",
    icon: Sparkles,
  },
  {
    title: "Community Signals",
    description: "Leaderboards, clubs, and shared progress keep reading social.",
    icon: Users,
  },
  {
    title: "Guided Journeys",
    description: "Personalised goals and automations aligned with your reading rhythm.",
    icon: Compass,
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Features</p>
        <h2 className="serif-heading text-3xl text-[color:var(--text)] sm:text-4xl">
          Built for discerning readers
        </h2>
        <p className="text-base text-muted">
          Every interaction balances clarity, calm, and control.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
              className="card-surface hover-lift h-full rounded-[1.5rem] p-6"
            >
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl border border-card-border/60 bg-[color:var(--surface)]/70">
                <Icon className="h-5 w-5 text-[color:var(--accent)]" />
              </div>
              <h3 className="serif-heading text-2xl text-[color:var(--text)]">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.description}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

