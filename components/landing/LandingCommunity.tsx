"use client"

import { motion } from "framer-motion"

const members = ["Amelia", "Jonah", "Priya", "Ezra"]

export function LandingCommunity() {
  return (
    <motion.section
      id="community"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid gap-8 rounded-[2rem] border border-card-border/70 bg-[color:var(--surface)]/80 p-8 shadow-[var(--card-shadow)] lg:grid-cols-2"
    >
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Community</p>
        <h2 className="serif-heading text-3xl">Read in good company</h2>
        <p className="text-base text-muted">
          Share progress, celebrate milestones, and start challenges with your closest reading circle.
        </p>
        <ul className="space-y-3 text-sm text-muted">
          <li>• Invite friends into beautifully designed clubs</li>
          <li>• Weekly leaderboards with calm, meaningful metrics</li>
          <li>• Achievements that feel like a premium collection</li>
        </ul>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
        className="rounded-[1.5rem] border border-card-border/60 bg-gradient-to-br from-[color:var(--surface)] via-[#f0f4ff] to-[#e1e9ff] p-6 dark:from-[#10131a] dark:via-[#151a24] dark:to-[#0f1218]"
      >
        <div className="h-full rounded-[1.25rem] border border-white/40 bg-white/60 p-6 shadow-inner backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Club Snapshot</p>
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm dark:bg-white/10">
              <p className="text-xs text-muted">This Week</p>
              <p className="text-3xl font-semibold text-[color:var(--text)]">2,318 pages</p>
              <p className="text-xs text-muted">Across 48 reading sessions</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map((name, idx) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + idx * 0.05, duration: 0.3 }}
                  className="rounded-2xl border border-card-border/60 bg-white/70 px-4 py-3 text-sm shadow-sm dark:bg-white/5"
                >
                  <p className="font-medium text-[color:var(--text)]">{name}</p>
                  <p className="text-xs text-muted">+124 pages</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}

