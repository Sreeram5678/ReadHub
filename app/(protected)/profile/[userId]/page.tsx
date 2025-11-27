import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PublicProfileClient } from "@/components/profile/PublicProfileClient"

export default async function PublicProfilePage({
  params,
}: {
  params: { userId: string }
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // If viewing own profile, redirect to the main profile page
  if (params.userId === session.user.id) {
    redirect("/profile")
  }

  return <PublicProfileClient userId={params.userId} />
}

