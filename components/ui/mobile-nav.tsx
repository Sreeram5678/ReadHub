"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ChevronDown, Crown, BookOpen, Users, Trophy, Calendar, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  userName: string
}

export function MobileNav({ userName }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [expandedHub, setExpandedHub] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
  }

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
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive("/dashboard")
                  ? "bg-[color:var(--accent)]/10 text-[color:var(--text)]"
                  : "text-muted hover:bg-muted/20 hover:text-[color:var(--text)]"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              <Crown className="h-4 w-4" />
              Dashboard
            </Link>

            {/* Reading Hub */}
            <div className="mt-2">
              <button
                onClick={() => setExpandedHub(expandedHub === "reading" ? null : "reading")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-muted/20 hover:text-[color:var(--text)] transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Reading
                <ChevronDown className={cn(
                  "ml-auto h-3 w-3 transition-transform duration-200",
                  expandedHub === "reading" && "rotate-180"
                )} />
              </button>
              {expandedHub === "reading" && (
                <div className="ml-6 mt-1 space-y-1">
                  {READING_HUB.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive(href)
                          ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                          : "text-muted hover:bg-muted/20 hover:text-[color:var(--text)]"
                      )}
                      onClick={() => setOpen(false)}
                      prefetch={true}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Community Hub */}
            <div className="mt-2">
              <button
                onClick={() => setExpandedHub(expandedHub === "community" ? null : "community")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-muted/20 hover:text-[color:var(--text)] transition-colors"
              >
                <Users className="h-4 w-4" />
                Community
                <ChevronDown className={cn(
                  "ml-auto h-3 w-3 transition-transform duration-200",
                  expandedHub === "community" && "rotate-180"
                )} />
              </button>
              {expandedHub === "community" && (
                <div className="ml-6 mt-1 space-y-1">
                  {COMMUNITY_HUB.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive(href)
                          ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                          : "text-muted hover:bg-muted/20 hover:text-[color:var(--text)]"
                      )}
                      onClick={() => setOpen(false)}
                      prefetch={true}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Link */}
            <Link
              href="/profile"
              className={cn(
                "mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive("/profile")
                  ? "bg-[color:var(--accent)]/10 text-[color:var(--text)]"
                  : "text-muted hover:bg-muted/20 hover:text-[color:var(--text)]"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Profile
            </Link>

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

