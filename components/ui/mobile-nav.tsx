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
        className="md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5 transition-transform" /> : <Menu className="h-5 w-5 transition-transform" />}
      </Button>
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50 md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 py-4 space-y-1">
            <Link
              href="/dashboard"
              className={cn(
                "block text-sm font-medium transition-all duration-200 py-2 px-3 rounded-md",
                isActive("/dashboard")
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Dashboard
            </Link>
            <Link
              href="/books"
              className={cn(
                "block text-sm font-medium transition-all duration-200 py-2 px-3 rounded-md",
                isActive("/books")
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              My Books
            </Link>
            <Link
              href="/tbr"
              className={cn(
                "block text-sm font-medium transition-all duration-200 py-2 px-3 rounded-md",
                isActive("/tbr")
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              TBR
            </Link>
            <Link
              href="/series"
              className={cn(
                "block text-sm font-medium transition-all duration-200 py-2 px-3 rounded-md",
                isActive("/series")
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Series
            </Link>
            <Link
              href="/leaderboard"
              className={cn(
                "block text-sm font-medium transition-all duration-200 py-2 px-3 rounded-md",
                isActive("/leaderboard")
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Leaderboard
            </Link>
            <Link
              href="/friends"
              className={cn(
                "block text-sm font-medium transition-all duration-200 py-2 px-3 rounded-md",
                isActive("/friends")
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Friends
            </Link>
            <Link
              href="/challenges"
              className={cn(
                "block text-sm font-medium transition-all duration-200 py-2 px-3 rounded-md",
                isActive("/challenges")
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Challenges
            </Link>
            <Link
              href="/reminders"
              className={cn(
                "block text-sm font-medium transition-all duration-200 py-2 px-3 rounded-md",
                isActive("/reminders")
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Reminders
            </Link>
            <Link
              href="/groups"
              className={cn(
                "block text-sm font-medium transition-all duration-200 py-2 px-3 rounded-md",
                isActive("/groups")
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Groups
            </Link>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-2">{userName}</p>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

