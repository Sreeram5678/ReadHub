import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

export const dynamic = "force-static"
export const revalidate = 3600

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password
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
              const email = formData.get("email") as string

              if (!email) {
                redirect("/forgot-password?error=Please enter your email address")
              }

              try {
                const user = await db.user.findUnique({
                  where: { email },
                })

                redirect("/forgot-password?success=If an account exists with that email, a password reset link has been sent.")
              } catch (error) {
                console.error("Forgot password error:", error)
                redirect("/forgot-password?error=Something went wrong. Please try again.")
              }
            }}
            className="space-y-4"
          >
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
            <Button type="submit" className="w-full" variant="default">
              Send Reset Link
            </Button>
          </form>
          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

