-- AlterTable
ALTER TABLE "Book" ADD COLUMN "priority" INTEGER;

-- CreateIndex
CREATE INDEX "Book_userId_status_priority_idx" ON "Book"("userId", "status", "priority");

