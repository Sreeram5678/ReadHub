"use client"

import { motion } from "framer-motion"

export function LandingShowcase() {
  return (
    <motion.section
      id="screens"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">App Tour</p>
        <h2 className="serif-heading text-3xl">Precision-crafted interfaces</h2>
        <p className="text-base text-muted">A cohesive suite of dashboards, timers, and insights.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((panel, idx) => (
          <motion.div
            key={panel}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
            className="rounded-[2rem] border border-card-border/70 bg-gradient-to-br from-[color:var(--surface)] to-transparent p-6 shadow-[var(--card-shadow)]"
          >
            <div className="aspect-[4/3] rounded-[1.5rem] bg-muted/20" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

