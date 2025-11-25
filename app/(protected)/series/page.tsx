import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SeriesPageClient } from "@/components/books/SeriesPageClient"

export default async function SeriesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return <SeriesPageClient />
}

