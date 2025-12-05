import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { db } from "./db"
import bcrypt from "bcryptjs"

// Support both legacy NEXTAUTH_* and Auth.js v5 AUTH_* env names
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET

// Derive NEXTAUTH_URL/AUTH_URL (used by Auth.js) with a Vercel fallback
const derivedAuthUrl =
  process.env.AUTH_URL ??
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined)

// Make the URL visible to NextAuth at runtime if it was missing
if (derivedAuthUrl) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? derivedAuthUrl
  process.env.AUTH_URL = process.env.AUTH_URL ?? derivedAuthUrl
}

// Fail fast with clear messages instead of vague "Configuration" errors
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

// Log a safe summary so we can see what the runtime sees (no secrets)
console.log("[auth-config]", {
  hasSecret: !!authSecret,
  hasGoogleId: !!googleClientId,
  hasGoogleSecret: !!googleClientSecret,
  authUrl: process.env.AUTH_URL,
  nextauthUrl: process.env.NEXTAUTH_URL,
  vercelUrl: process.env.VERCEL_URL,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db) as any,
  trustHost: true,
  secret: authSecret,
  debug: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // With PrismaAdapter, user parameter contains the database user
      if (session.user && user) {
        session.user.id = user.id
      } else if (session.user && token?.sub) {
        // For credentials provider, use token.sub as user id
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects go to the dashboard after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/login",
  },
})

