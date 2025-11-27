import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PublicProfileClient } from "@/components/profile/PublicProfileClient"

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const { userId } = await params

  // If viewing own profile, redirect to the main profile page
  if (userId === session.user.id) {
    redirect("/profile")
  }

  return <PublicProfileClient userId={userId} />
}

