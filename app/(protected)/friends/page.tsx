import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FriendsList } from "@/components/friends/FriendsList"

export default async function FriendsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return <FriendsList />
}

