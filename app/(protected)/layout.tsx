import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/ui/mobile-nav"

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
      <nav className="border-b relative">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/dashboard" className="text-lg md:text-xl font-bold">
              Book Tracker
            </Link>
            <div className="hidden md:flex gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              prefetch={true}
            >
              Dashboard
            </Link>
            <Link
              href="/books"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              prefetch={true}
            >
              My Books
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              prefetch={true}
            >
              Leaderboard
            </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
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

