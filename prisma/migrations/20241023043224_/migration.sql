-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'ATTACHMENT');

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL,
    "mid" TEXT,
    "text" TEXT,
    "attachments" JSONB,
    "timestamp" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isFromBot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_senderId_timestamp_idx" ON "Message"("senderId", "timestamp");
