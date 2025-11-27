"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-card-border/70 bg-[color:var(--surface)]/80 px-6 py-16 shadow-[var(--card-shadow)] backdrop-blur-2xl sm:px-12 lg:flex lg:items-center lg:justify-between">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl space-y-6"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-card-border/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted">
          Premium Reading OS
        </p>
        <div className="space-y-4">
          <h1 className="serif-heading text-4xl leading-tight text-[color:var(--text)] sm:text-5xl lg:text-6xl">
            Your Reading Life, Supercharged
          </h1>
          <p className="text-lg text-muted">
            Track your books, build habits, and read with clarity. Designed with
            a minimalist Apple Books-inspired aesthetic for a calm, focused
            reading flow.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#features">Explore Features</Link>
          </Button>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mt-10 w-full max-w-md rounded-[2rem] border border-card-border/80 bg-gradient-to-br from-[color:var(--surface)] to-transparent p-6 shadow-[var(--card-shadow)] lg:mt-0"
        aria-hidden="true"
      >
        <div className="aspect-[3/2] rounded-[1.5rem] bg-gradient-to-br from-[#1a1c22] via-[#141821] to-[#0b0d10] p-6">
          <div className="space-y-4 text-white/80">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
              <span>READING OVERVIEW</span>
              <span>Today</span>
            </div>
            <div className="rounded-2xl bg-white/5 p-5 backdrop-blur">
              <p className="text-sm text-white/60">Current Streak</p>
              <p className="text-4xl font-semibold text-white">28 days</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="text-xs text-white/50">Pages this week</p>
                <p className="text-3xl font-semibold text-white">612</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="text-xs text-white/50">Books in focus</p>
                <p className="text-3xl font-semibold text-white">4</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4 text-white/70">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Activity Feed</p>
              <p className="text-sm">You logged 42 pages in “Tomorrow, and Tomorrow, and Tomorrow”.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

