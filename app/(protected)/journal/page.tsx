import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { JournalClient } from "@/components/journal/JournalClient"

// Revalidate every 60 seconds to balance freshness with performance
export const revalidate = 60

async function getJournalEntries(userId: string) {
  const entries = await db.readingJournal.findMany({
    where: { userId },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
        },
      },
    },
    orderBy: { date: "desc" },
  })

  // Convert Date objects to strings for client component
  return entries.map(entry => ({
    ...entry,
    date: entry.date.toISOString(),
    createdAt: entry.createdAt.toISOString(),
  }))
}

export default async function JournalPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const journalEntries = await getJournalEntries(session.user.id)

  return <JournalClient initialEntries={journalEntries} />
}
