import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MemoryPalaceClient } from "@/components/memory-palace/MemoryPalaceClient"

export default async function MemoryPalacePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return <MemoryPalaceClient />
}

