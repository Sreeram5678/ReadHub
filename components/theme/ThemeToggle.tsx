"use client"

import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "./ThemeProvider"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-pressed={isDark}
      aria-label="Toggle theme"
      className="group relative flex items-center gap-2 rounded-full border border-card-border/70 bg-[color:var(--surface)]/80 px-4 py-2 text-xs font-medium text-muted backdrop-blur-xl transition-all hover:border-accent/60 hover:text-text dark:bg-[color:var(--surface)]/70"
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          className={cn(
            "absolute h-4 w-4 text-amber-500 transition-all",
            isDark ? "opacity-0 -translate-y-1 rotate-45" : "opacity-100 translate-y-0 rotate-0"
          )}
        />
        <Moon
          className={cn(
            "absolute h-4 w-4 text-blue-300 transition-all",
            isDark ? "opacity-100 translate-y-0 rotate-0" : "opacity-0 translate-y-1 -rotate-45"
          )}
        />
      </span>
      <span className="hidden sm:inline">{isDark ? "Light Mode" : "Dark Mode"}</span>
      <span className="absolute inset-0 -z-10 rounded-full bg-accent/10 opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.button>
  )
}

