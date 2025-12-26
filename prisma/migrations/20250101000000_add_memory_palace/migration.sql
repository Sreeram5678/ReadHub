-- AlterTable: Add location fields to ReadingSession
ALTER TABLE "ReadingSession" ADD COLUMN "location" TEXT;
ALTER TABLE "ReadingSession" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "ReadingSession" ADD COLUMN "longitude" DOUBLE PRECISION;

-- CreateIndex for ReadingSession location
CREATE INDEX "ReadingSession_latitude_longitude_idx" ON "ReadingSession"("latitude", "longitude");

-- CreateTable: BookMemory
CREATE TABLE "BookMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "memoryNote" TEXT,
    "lifeEvent" TEXT,
    "memoryDate" TIMESTAMP(3),
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookMemory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookMemory_userId_idx" ON "BookMemory"("userId");
CREATE INDEX "BookMemory_bookId_idx" ON "BookMemory"("bookId");
CREATE INDEX "BookMemory_userId_bookId_idx" ON "BookMemory"("userId", "bookId");
CREATE INDEX "BookMemory_latitude_longitude_idx" ON "BookMemory"("latitude", "longitude");
CREATE INDEX "BookMemory_memoryDate_idx" ON "BookMemory"("memoryDate");

-- AddForeignKey
ALTER TABLE "BookMemory" ADD CONSTRAINT "BookMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookMemory" ADD CONSTRAINT "BookMemory_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

