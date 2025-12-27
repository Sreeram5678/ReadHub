"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, BookOpen, Users, Trophy, Calendar, MessageSquare, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

const READING_HUB = [
  { href: "/books", label: "My Books", icon: BookOpen },
  { href: "/journal", label: "Journal", icon: Calendar },
  { href: "/memory-palace", label: "Timeline", icon: Calendar },
]

const COMMUNITY_HUB = [
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/groups", label: "Groups", icon: MessageSquare },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
]

interface HubNavigationProps {
  className?: string
}

export function HubNavigation({ className }: HubNavigationProps) {
  const pathname = usePathname()
  const [activeHub, setActiveHub] = useState<string | null>(null)

  const isHubActive = (hub: typeof READING_HUB) => {
    return hub.some(item => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)))
  }

  const readingHubActive = isHubActive(READING_HUB)
  const communityHubActive = isHubActive(COMMUNITY_HUB)

  return (
    <nav className={cn("flex items-center gap-2", className)}>
      {/* Dashboard - Always visible */}
      <Link
        href="/dashboard"
        className={cn(
          "group flex items-center gap-2 whitespace-nowrap text-sm font-medium px-3 py-2 rounded-lg transition-all",
          pathname === "/dashboard"
            ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)] border border-[color:var(--accent)]/20"
            : "text-muted hover:text-[color:var(--text)] hover:bg-muted/20"
        )}
      >
        <Crown className="h-4 w-4" />
        Dashboard
      </Link>

      {/* Reading Hub */}
      <div className="relative">
        <button
          onClick={() => setActiveHub(activeHub === "reading" ? null : "reading")}
          className={cn(
            "group flex items-center gap-2 whitespace-nowrap text-sm font-medium px-3 py-2 rounded-lg transition-all",
            readingHubActive
              ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)] border border-[color:var(--accent)]/20"
              : "text-muted hover:text-[color:var(--text)] hover:bg-muted/20"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Reading
          <ChevronDown className={cn(
            "h-3 w-3 transition-transform duration-200",
            activeHub === "reading" && "rotate-180"
          )} />
        </button>

        <AnimatePresence>
          {activeHub === "reading" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-card-border/60 bg-[color:var(--surface)]/95 p-2 shadow-[var(--card-shadow)] backdrop-blur-xl"
            >
              {READING_HUB.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setActiveHub(null)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : "text-muted hover:bg-muted/20 hover:text-[color:var(--text)]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Community Hub */}
      <div className="relative">
        <button
          onClick={() => setActiveHub(activeHub === "community" ? null : "community")}
          className={cn(
            "group flex items-center gap-2 whitespace-nowrap text-sm font-medium px-3 py-2 rounded-lg transition-all",
            communityHubActive
              ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)] border border-[color:var(--accent)]/20"
              : "text-muted hover:text-[color:var(--text)] hover:bg-muted/20"
          )}
        >
          <Users className="h-4 w-4" />
          Community
          <ChevronDown className={cn(
            "h-3 w-3 transition-transform duration-200",
            activeHub === "community" && "rotate-180"
          )} />
        </button>

        <AnimatePresence>
          {activeHub === "community" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-card-border/60 bg-[color:var(--surface)]/95 p-2 shadow-[var(--card-shadow)] backdrop-blur-xl"
            >
              {COMMUNITY_HUB.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setActiveHub(null)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : "text-muted hover:bg-muted/20 hover:text-[color:var(--text)]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
