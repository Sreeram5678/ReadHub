import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/ui/mobile-nav"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { NavLink } from "@/components/ui/nav-link"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b relative bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/dashboard" className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ReadHub
            </Link>
            <div className="hidden md:flex gap-1">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/books">My Books</NavLink>
            <NavLink href="/tbr">TBR</NavLink>
            <NavLink href="/series">Series</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
            <NavLink href="/friends">Friends</NavLink>
            <NavLink href="/challenges">Challenges</NavLink>
            <NavLink href="/reminders">Reminders</NavLink>
            <NavLink href="/groups">Groups</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <span className="hidden sm:inline-block text-sm text-muted-foreground">
              {session.user?.name || session.user?.email}
            </span>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <Button type="submit" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign Out
              </Button>
            </form>
            <MobileNav userName={session.user?.name || session.user?.email || ""} />
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-4 md:py-8">{children}</main>
    </div>
  )
}

