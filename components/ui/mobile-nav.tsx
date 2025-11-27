"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOutAction } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  userName: string
}

export function MobileNav({ userName }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden rounded-full border border-card-border/60 bg-[color:var(--surface)]/70 backdrop-blur"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <X className="h-5 w-5 transition-transform" /> : <Menu className="h-5 w-5 transition-transform" />}
      </Button>
      {open && (
        <div className="absolute left-4 right-4 top-20 z-50 md:hidden">
          <div className="rounded-[1.5rem] border border-card-border/60 bg-[color:var(--surface)]/95 p-4 shadow-[var(--card-shadow)] backdrop-blur-xl">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/books", label: "My Books" },
              { href: "/tbr", label: "TBR" },
              { href: "/series", label: "Series" },
              { href: "/leaderboard", label: "Leaderboard" },
              { href: "/friends", label: "Friends" },
              { href: "/challenges", label: "Challenges" },
              { href: "/reminders", label: "Reminders" },
              { href: "/groups", label: "Groups" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "block rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-[color:var(--accent)]/10 text-[color:var(--text)]"
                    : "text-muted hover:bg-muted/20 hover:text-[color:var(--text)]"
                )}
                onClick={() => setOpen(false)}
                prefetch={true}
              >
                {label}
              </Link>
            ))}
            <div className="mt-3 rounded-xl border border-dashed border-card-border/60 px-4 py-3 text-sm text-muted">
              {userName}
            </div>
            <form action={signOutAction} className="mt-3">
              <Button type="submit" variant="outline" size="sm" className="w-full justify-center rounded-full">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

