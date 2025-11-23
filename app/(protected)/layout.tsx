import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
      <nav className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold">
              Book Tracker
            </Link>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/books"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                My Books
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Leaderboard
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.name || session.user?.email}
            </span>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

