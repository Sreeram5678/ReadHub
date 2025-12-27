import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MemoryPalaceClient } from "@/components/memory-palace/MemoryPalaceClient"

// Revalidate every 60 seconds to balance freshness with performance
export const revalidate = 60

export default async function MemoryPalacePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return <MemoryPalaceClient />
}

