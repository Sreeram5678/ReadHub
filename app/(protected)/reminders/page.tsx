import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RemindersList } from "@/components/reminders/RemindersList"

export default async function RemindersPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return <RemindersList />
}

