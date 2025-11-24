# Groups and Chat Feature Migration

This migration adds the groups and chat functionality to your Book Reading Tracker application.

## Database Migration

Run this SQL in your Supabase SQL Editor (or your PostgreSQL database):

```sql
-- Create Group table
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "creatorId" TEXT NOT NULL,
    "topic" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Group_creatorId_idx" ON "Group"("creatorId");
CREATE INDEX "Group_isPublic_idx" ON "Group"("isPublic");
CREATE INDEX "Group_topic_idx" ON "Group"("topic");

ALTER TABLE "Group" ADD CONSTRAINT "Group_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create GroupMember table
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");
CREATE INDEX "GroupMember_userId_idx" ON "GroupMember"("userId");
CREATE INDEX "GroupMember_role_idx" ON "GroupMember"("role");

ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create GroupMessage table
CREATE TABLE "GroupMessage" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "replyToId" TEXT,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GroupMessage_groupId_idx" ON "GroupMessage"("groupId");
CREATE INDEX "GroupMessage_userId_idx" ON "GroupMessage"("userId");
CREATE INDEX "GroupMessage_createdAt_idx" ON "GroupMessage"("createdAt");
CREATE INDEX "GroupMessage_replyToId_idx" ON "GroupMessage"("replyToId");

ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "GroupMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create GroupMessageAttachment table
CREATE TABLE "GroupMessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMessageAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GroupMessageAttachment_messageId_idx" ON "GroupMessageAttachment"("messageId");

ALTER TABLE "GroupMessageAttachment" ADD CONSTRAINT "GroupMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "GroupMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create GroupMessageReaction table
CREATE TABLE "GroupMessageReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMessageReaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GroupMessageReaction_messageId_userId_emoji_key" ON "GroupMessageReaction"("messageId", "userId", "emoji");
CREATE INDEX "GroupMessageReaction_messageId_idx" ON "GroupMessageReaction"("messageId");
CREATE INDEX "GroupMessageReaction_userId_idx" ON "GroupMessageReaction"("userId");

ALTER TABLE "GroupMessageReaction" ADD CONSTRAINT "GroupMessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "GroupMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMessageReaction" ADD CONSTRAINT "GroupMessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## After Migration

1. Run `npx prisma generate` to regenerate the Prisma client with the new models
2. Restart your development server
3. The Groups feature will be available in the navigation menu

## Features Added

- **Groups**: Create public or private groups for book discussions
- **Real-time Chat**: Server-Sent Events (SSE) for real-time message updates
- **Message Features**: 
  - Replies to messages
  - Edit and delete messages (with permissions)
  - Reactions (emoji)
  - File/image attachments support
- **Group Management**:
  - Admin and moderator roles
  - Member management
  - Group settings (name, description, topic, visibility)
- **Search & Discovery**: Search groups by name, description, or topic

## Usage

1. Navigate to `/groups` to see all available groups
2. Create a new group or join existing ones
3. Click on a group to open the chat interface
4. Start chatting with group members in real-time!

