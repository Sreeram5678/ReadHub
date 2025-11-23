import { auth } from "@/lib/auth-middleware"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/books") ||
    req.nextUrl.pathname.startsWith("/leaderboard")

  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}

