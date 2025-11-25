-- AlterTable: Add series and DNF fields to Book
ALTER TABLE "Book" ADD COLUMN "seriesName" TEXT;
ALTER TABLE "Book" ADD COLUMN "seriesNumber" INTEGER;
ALTER TABLE "Book" ADD COLUMN "dnfReason" TEXT;

-- CreateIndex
CREATE INDEX "Book_userId_seriesName_idx" ON "Book"("userId", "seriesName");

-- CreateTable: Rating
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "overallRating" INTEGER,
    "plotRating" INTEGER,
    "characterRating" INTEGER,
    "writingRating" INTEGER,
    "pacingRating" INTEGER,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Rating_userId_bookId_key" ON "Rating"("userId", "bookId");
CREATE INDEX "Rating_userId_idx" ON "Rating"("userId");
CREATE INDEX "Rating_bookId_idx" ON "Rating"("bookId");

ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ChapterNote
CREATE TABLE "ChapterNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapterNumber" INTEGER,
    "chapterTitle" TEXT,
    "note" TEXT NOT NULL,
    "pageNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChapterNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChapterNote_userId_idx" ON "ChapterNote"("userId");
CREATE INDEX "ChapterNote_bookId_idx" ON "ChapterNote"("bookId");
CREATE INDEX "ChapterNote_bookId_chapterNumber_idx" ON "ChapterNote"("bookId", "chapterNumber");

ALTER TABLE "ChapterNote" ADD CONSTRAINT "ChapterNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChapterNote" ADD CONSTRAINT "ChapterNote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: BookRead
CREATE TABLE "BookRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "readNumber" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookRead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BookRead_userId_idx" ON "BookRead"("userId");
CREATE INDEX "BookRead_bookId_idx" ON "BookRead"("bookId");
CREATE INDEX "BookRead_userId_bookId_readNumber_idx" ON "BookRead"("userId", "bookId", "readNumber");

ALTER TABLE "BookRead" ADD CONSTRAINT "BookRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookRead" ADD CONSTRAINT "BookRead_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ReadingJournal
CREATE TABLE "ReadingJournal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT,
    "entry" TEXT NOT NULL,
    "mood" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingJournal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReadingJournal_userId_idx" ON "ReadingJournal"("userId");
CREATE INDEX "ReadingJournal_bookId_idx" ON "ReadingJournal"("bookId");
CREATE INDEX "ReadingJournal_userId_date_idx" ON "ReadingJournal"("userId", "date");

ALTER TABLE "ReadingJournal" ADD CONSTRAINT "ReadingJournal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReadingJournal" ADD CONSTRAINT "ReadingJournal_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: Vocabulary
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT,
    "word" TEXT NOT NULL,
    "definition" TEXT,
    "pageNumber" INTEGER,
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Vocabulary_userId_idx" ON "Vocabulary"("userId");
CREATE INDEX "Vocabulary_bookId_idx" ON "Vocabulary"("bookId");
CREATE INDEX "Vocabulary_userId_word_idx" ON "Vocabulary"("userId", "word");

ALTER TABLE "Vocabulary" ADD CONSTRAINT "Vocabulary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vocabulary" ADD CONSTRAINT "Vocabulary_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: BookLoan
CREATE TABLE "BookLoan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "borrowerName" TEXT NOT NULL,
    "borrowerEmail" TEXT,
    "loanedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookLoan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BookLoan_userId_idx" ON "BookLoan"("userId");
CREATE INDEX "BookLoan_bookId_idx" ON "BookLoan"("bookId");
CREATE INDEX "BookLoan_userId_returnedAt_idx" ON "BookLoan"("userId", "returnedAt");

ALTER TABLE "BookLoan" ADD CONSTRAINT "BookLoan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookLoan" ADD CONSTRAINT "BookLoan_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

