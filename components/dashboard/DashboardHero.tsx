"use client"

interface DashboardHeroProps {
  userName: string
  totalPagesRead: number
  todayPages: number
  readingStreak: number
  completionPercentage: number
}

export function DashboardHero({
  userName,
  totalPagesRead,
  todayPages,
  readingStreak,
  completionPercentage,
}: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-card-border/60 bg-gradient-to-br from-[color:var(--surface)] via-[color:var(--surface)]/80 to-[#e8f2ff] px-8 py-10 shadow-[var(--card-shadow)] transition-transform duration-300 hover:-translate-y-0.5 dark:to-[#121722]">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Welcome back</p>
          <h1 className="serif-heading text-4xl text-[color:var(--text)] sm:text-5xl">
            {userName}, your reading rhythm is on point.
          </h1>
          <p className="text-base text-muted">
            Keep the momentum going with a curated blend of insights, trends, and quick actions that
            feel like a bespoke reading room.
          </p>
        </div>
        <div className="grid gap-4 rounded-[2rem] border border-white/30 bg-white/40 p-6 text-sm shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <HeroStat label="Pages read" value={totalPagesRead.toLocaleString()} detail="All-time" />
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroStat label="Today's pages" value={todayPages} />
            <HeroStat label="Streak" value={`${readingStreak} days`} detail="Consecutive" />
          </div>
          <div className="rounded-2xl border border-white/40 bg-white/70 p-4 text-center text-[color:var(--text)] shadow-sm dark:border-white/10 dark:bg-white/10">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Library Completion</p>
            <p className="text-4xl font-semibold">{completionPercentage}%</p>
            <p className="text-xs text-muted">of tracked books finished</p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-70 blur-3xl">
        <div className="absolute -top-10 right-0 h-48 w-48 rounded-full bg-[color:var(--accent)]/20" />
        <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-[#ffb86c]/30" />
      </div>
    </section>
  )
}

function HeroStat({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="text-left text-[color:var(--text)]">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
      {detail && <p className="text-xs text-muted">{detail}</p>}
    </div>
  )
}

