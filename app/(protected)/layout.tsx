import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TopNav } from "@/components/layout/TopNav"

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
    <div className="min-h-screen bg-[color:var(--bg)]">
      <TopNav userName={session.user?.name || session.user?.email || ""} />
      <main className="mx-auto min-h-[calc(100vh-5rem)] max-w-6xl px-4 py-6 md:py-10">
        {children}
      </main>
    </div>
  )
}

