"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { startTransition } from "react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/ui/mobile-nav"
import { HubNavigation } from "@/components/layout/HubNavigation"
import { cn } from "@/lib/utils"


interface TopNavProps {
  userName?: string
}

export function TopNav({ userName = "Reader" }: TopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  const handleLogReadingClick = () => {
    // Defer the event dispatch to avoid blocking the main thread
    startTransition(() => {
      window.dispatchEvent(new CustomEvent("open-log-reading"))
    })
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-card-border/60 bg-[color:var(--surface)]/70 backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="serif-heading text-2xl font-semibold tracking-tight text-[color:var(--text)]"
          >
            ReadHub
          </Link>
          <HubNavigation className="hidden md:flex" />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Button size="sm" onClick={handleLogReadingClick}>
              Log Reading
            </Button>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-full border border-card-border/80 bg-[color:var(--surface)]/60 px-3 py-1.5 transition-all hover:bg-[color:var(--surface)]/80 hover:border-card-border cursor-pointer"
            >
              <span className="text-xs font-medium text-muted">{userName}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent)]/12 text-sm font-semibold text-[color:var(--accent)]">
                {initials || "RH"}
              </div>
            </Link>
          </div>
          <MobileNav userName={userName} />
        </div>
      </div>
    </motion.header>
  )
}

