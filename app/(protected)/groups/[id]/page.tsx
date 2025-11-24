/* eslint-disable @next/next/no-img-element */
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { GroupChat } from "@/components/groups/GroupChat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Lock, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { JoinGroupButton } from "@/components/groups/JoinGroupButton"
import { GroupFormWrapper } from "@/components/groups/GroupFormWrapper"
import { AddMemberDialog } from "@/components/groups/AddMemberDialog"
import { GroupActionsDropdown } from "@/components/groups/GroupActionsDropdown"

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id
  const { id } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const group = await (db as any).group.findUnique({
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

  const isMember = group.members.some((m: { userId: string }) => m.userId === userId)
  const userMember = group.members.find((m: { userId: string }) => m.userId === userId)
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
        <div className="flex items-center gap-2">
          {(userRole === "admin" || userRole === "moderator") && (
            <GroupFormWrapper
              group={{
                id: group.id,
                name: group.name,
                description: group.description ?? undefined,
                isPublic: group.isPublic,
                topic: group.topic ?? undefined,
                image: group.image ?? undefined,
              }}
              groupId={group.id}
            />
          )}
          {userRole === "admin" && (
            <GroupActionsDropdown
              groupId={group.id}
              groupName={group.name}
              groupDescription={group.description ?? undefined}
              isPublic={group.isPublic}
              topic={group.topic ?? undefined}
              image={group.image ?? undefined}
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">Group Info</CardTitle>
              {(userRole === "admin" || userRole === "moderator") && (
                <AddMemberDialog
                  groupId={group.id}
                  currentUserRole={userRole}
                  existingMemberIds={group.members.map(
                    (member: { userId: string }) => member.userId
                  )}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{group._count.members} members</span>
            </div>
            <div className="text-sm">
              <div className="text-muted-foreground mb-2">Members:</div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {group.members.map((member: { id: string; userId: string; role: string; user: { id: string; name: string | null; email: string; image: string | null } }) => {
                  if (!member || !member.user) return null
                  return (
                  <div key={member.id} className="flex items-center gap-2 text-sm">
                    {member.user?.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user?.name || member.user?.email || "User"}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                        {((member.user?.name || member.user?.email || "U")[0] || "U").toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 truncate">
                      {member.user?.name || member.user?.email || "Unknown"}
                    </span>
                    {member.role !== "member" && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {member.role}
                      </span>
                    )}
                  </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 p-0 overflow-hidden">
          {isMember ? (
            <GroupChat groupId={group.id} currentUserId={userId} userRole={userRole} />
          ) : (
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Join to start chatting</h3>
                <p className="text-muted-foreground mb-6">
                  You need to join this group to participate in the chat.
                </p>
                <JoinGroupButton groupId={id} />
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

