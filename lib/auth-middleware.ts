import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

// Support both legacy NEXTAUTH_* and Auth.js v5 AUTH_* env names
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET
const githubClientId = process.env.AUTH_GITHUB_ID ?? process.env.GITHUB_CLIENT_ID
const githubClientSecret =
  process.env.AUTH_GITHUB_SECRET ?? process.env.GITHUB_CLIENT_SECRET

// Derive NEXTAUTH_URL/AUTH_URL for middleware as well
const derivedAuthUrl =
  process.env.AUTH_URL ??
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined)

if (derivedAuthUrl) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? derivedAuthUrl
  process.env.AUTH_URL = process.env.AUTH_URL ?? derivedAuthUrl
}

if (!authSecret) {
  throw new Error(
    "Missing AUTH_SECRET or NEXTAUTH_SECRET. Set it in your environment (Vercel project settings)."
  )
}

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth env vars. Set AUTH_GOOGLE_ID/SECRET or GOOGLE_CLIENT_ID/SECRET."
  )
}

// Auth config for middleware (Edge runtime compatible - no Prisma adapter)
export const { auth } = NextAuth({
  secret: authSecret,
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    ...(githubClientId && githubClientSecret
      ? [
          GitHub({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
})

