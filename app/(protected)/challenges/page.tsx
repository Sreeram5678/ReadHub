import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ChallengesList } from "@/components/challenges/ChallengesList"

export default async function ChallengesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return <ChallengesList />
}

