import { auth } from "@/lib/auth-middleware"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  const protectedPrefixes = [
    "/dashboard",
    "/books",
    "/leaderboard",
    "/profile",
    "/friends",
    "/groups",
    "/challenges",
    "/reminders",
    "/series",
    "/tbr",
    "/reading-speed",
    "/reading-speed-test",
    "/reading-logs",
    "/reading-sessions",
    "/reading-goals",
    "/reading-heatmap",
    "/reading-journal",
    "/quick-stats",
  ]

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix)
  )

  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url)
    const callbackUrl = `${req.nextUrl.pathname}${req.nextUrl.search}`
    loginUrl.searchParams.set("callbackUrl", callbackUrl)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
}

