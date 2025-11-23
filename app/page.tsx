import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Book Reading Tracker
          </h1>
          <p className="text-xl text-muted-foreground">
            Track your daily reading progress, compete with friends, and build
            better reading habits.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>
                Log pages read daily for each book you're reading
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Compete</CardTitle>
              <CardDescription>
                See how you rank on the leaderboard with your friends
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Build Habits</CardTitle>
              <CardDescription>
                Track your reading streaks and maintain consistency
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
