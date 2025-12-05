import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const dynamic = "force-static"
export const revalidate = 3600

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Sign up to start tracking your reading progress and compete with friends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {params.error}
            </div>
          )}
          {params.success && (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
              {params.success}
            </div>
          )}
          <form
            action={async (formData) => {
              "use server"
              const name = formData.get("name") as string
              const email = formData.get("email") as string
              const password = formData.get("password") as string
              const confirmPassword = formData.get("confirmPassword") as string

              if (password !== confirmPassword) {
                redirect("/signup?error=Passwords do not match")
              }

              if (password.length < 6) {
                redirect("/signup?error=Password must be at least 6 characters")
              }

              try {
                const existingUser = await db.user.findUnique({
                  where: { email },
                })

                if (existingUser) {
                  redirect("/signup?error=An account with this email already exists")
                }

                const hashedPassword = await bcrypt.hash(password, 10)

                await db.user.create({
                  data: {
                    email,
                    name: name || null,
                    password: hashedPassword,
                  },
                })

                await signIn("credentials", {
                  email,
                  password,
                  redirectTo: "/dashboard",
                })
              } catch (error) {
                console.error("Signup error:", error)
                redirect("/signup?error=Something went wrong. Please try again.")
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" variant="default">
              Sign up
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/dashboard" })
            }}
          >
            <Button type="submit" className="w-full" variant="outline">
              Sign up with Google
            </Button>
          </form>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

