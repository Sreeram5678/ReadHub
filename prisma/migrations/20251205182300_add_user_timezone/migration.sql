-- Add missing timezone column for users
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata';

-- Backfill any existing nulls just in case
UPDATE "User" SET "timezone" = 'Asia/Kolkata' WHERE "timezone" IS NULL;

