-- CreateTable
CREATE TABLE "ReadingSpeedTest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordsPerMinute" INTEGER NOT NULL,
    "wordsRead" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingSpeedTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT,
    "quoteText" TEXT NOT NULL,
    "pageNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "milestone" INTEGER NOT NULL,
    "bookId" TEXT,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingSpeedTest_userId_idx" ON "ReadingSpeedTest"("userId");
CREATE INDEX "ReadingSpeedTest_testDate_idx" ON "ReadingSpeedTest"("testDate");

-- CreateIndex
CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");
CREATE INDEX "Quote_bookId_idx" ON "Quote"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_userId_type_milestone_key" ON "Achievement"("userId", "type", "milestone");
CREATE INDEX "Achievement_userId_idx" ON "Achievement"("userId");
CREATE INDEX "Achievement_type_idx" ON "Achievement"("type");

-- AddForeignKey
ALTER TABLE "ReadingSpeedTest" ADD CONSTRAINT "ReadingSpeedTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

