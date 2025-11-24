import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { GroupChat } from "@/components/groups/GroupChat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Lock, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GroupForm } from "@/components/groups/GroupForm"
import { JoinGroupButton } from "@/components/groups/JoinGroupButton"

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const group = await db.group.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
          members: true,
        },
      },
    },
  })

  if (!group) {
    redirect("/groups")
  }

  const isMember = group.members.some((m) => m.userId === session.user.id)
  const userMember = group.members.find((m) => m.userId === session.user.id)
  const userRole = userMember?.role || null

  if (!group.isPublic && !isMember) {
    redirect("/groups")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/groups">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              {group.isPublic ? (
                <Globe className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Lock className="h-6 w-6 text-muted-foreground" />
              )}
              {group.name}
            </h1>
            {group.description && (
              <p className="text-muted-foreground mt-1">{group.description}</p>
            )}
            {group.topic && (
              <span className="text-xs text-muted-foreground mt-2 inline-block px-2 py-1 bg-muted rounded">
                {group.topic}
              </span>
            )}
          </div>
        </div>
        {(userRole === "admin" || userRole === "moderator") && (
          <GroupForm group={group} onSuccess={() => window.location.reload()} />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Group Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{group._count.members} members</span>
            </div>
            <div className="text-sm">
              <div className="text-muted-foreground mb-2">Members:</div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2 text-sm">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name || member.user.email}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                        {(member.user.name || member.user.email)[0].toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 truncate">
                      {member.user.name || member.user.email}
                    </span>
                    {member.role !== "member" && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {member.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              {isMember
                ? "Join the conversation"
                : "Join this group to start chatting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMember ? (
              <GroupChat groupId={group.id} currentUserId={session.user.id} userRole={userRole} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You need to join this group to participate in the chat.
                </p>
                <JoinGroupButton groupId={id} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

