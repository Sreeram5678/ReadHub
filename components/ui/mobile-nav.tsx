"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOutAction } from "@/app/actions/auth"

interface MobileNavProps {
  userName: string
}

export function MobileNav({ userName }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b z-50 md:hidden">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="/dashboard"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Dashboard
            </Link>
            <Link
              href="/books"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              My Books
            </Link>
            <Link
              href="/tbr"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              TBR
            </Link>
            <Link
              href="/series"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Series
            </Link>
            <Link
              href="/leaderboard"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Leaderboard
            </Link>
            <Link
              href="/friends"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Friends
            </Link>
            <Link
              href="/challenges"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Challenges
            </Link>
            <Link
              href="/reminders"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setOpen(false)}
              prefetch={true}
            >
              Reminders
            </Link>
            <Link
              href="/groups"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
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

