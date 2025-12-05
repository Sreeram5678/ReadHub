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

