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

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db) as any,
  trustHost: true,
  secret: authSecret,
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

