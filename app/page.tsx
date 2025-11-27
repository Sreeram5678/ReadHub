import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { LandingHero } from "@/components/landing/LandingHero"
import { LandingFeatures } from "@/components/landing/LandingFeatures"
import { LandingCommunity } from "@/components/landing/LandingCommunity"
import { LandingShowcase } from "@/components/landing/LandingShowcase"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/layout/Footer"

export const dynamic = 'force-dynamic'

export default async function Home() {
  let session = null
  try {
    session = await auth()
  } catch (error) {
    // If auth fails (e.g., database connection issue), show homepage anyway
    console.error("Auth error:", error)
  }

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <MarketingNav />
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10 sm:gap-20 sm:py-16">
        <LandingHero />
        <LandingFeatures />
        <LandingCommunity />
        <LandingShowcase />
      </main>
      <Footer />
    </div>
  )
}

function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-card-border/70 bg-[color:var(--surface)]/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="serif-heading text-2xl font-semibold">
          ReadHub
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="#features" className="transition-colors hover:text-[color:var(--text)]">
            Features
          </Link>
          <Link href="#community" className="transition-colors hover:text-[color:var(--text)]">
            Community
          </Link>
          <Link href="#screens" className="transition-colors hover:text-[color:var(--text)]">
            App Tour
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
