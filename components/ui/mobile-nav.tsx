"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  userName: string
}

export function MobileNav({ userName }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
  }

  const handleLogReadingClick = () => {
    setOpen(false)
    const isOnDashboard = pathname === "/dashboard"
    
    if (isOnDashboard) {
      // Dispatch custom event to open the dialog
      window.dispatchEvent(new CustomEvent("open-log-reading"))
    } else {
      // Navigate to dashboard first, then open dialog
      router.push("/dashboard")
      // Small delay to ensure the component is mounted
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-log-reading"))
      }, 300)
    }
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
              { href: "/memory-palace", label: "Memory Palace" },
              { href: "/leaderboard", label: "Leaderboard" },
              { href: "/friends", label: "Friends" },
              { href: "/groups", label: "Groups" },
              { href: "/profile", label: "Profile" },
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
            <Button
              onClick={handleLogReadingClick}
              className="mt-3 w-full"
              size="sm"
            >
              Log Reading
            </Button>
            <div className="mt-3 rounded-xl border border-dashed border-card-border/60 px-4 py-3 text-sm text-muted">
              {userName}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

