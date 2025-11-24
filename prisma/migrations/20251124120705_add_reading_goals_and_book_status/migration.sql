-- AlterTable
ALTER TABLE "Book" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'reading';
ALTER TABLE "Book" ADD COLUMN "completedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Book_status_idx" ON "Book"("status");

-- CreateTable
CREATE TABLE "ReadingGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingGoal_userId_idx" ON "ReadingGoal"("userId");
CREATE INDEX "ReadingGoal_type_period_idx" ON "ReadingGoal"("type", "period");

-- AddForeignKey
ALTER TABLE "ReadingGoal" ADD CONSTRAINT "ReadingGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

