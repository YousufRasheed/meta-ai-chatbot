-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processingAt" TIMESTAMP(3),
ADD COLUMN     "processingBy" TEXT;

-- CreateIndex
CREATE INDEX "Message_senderId_processed_timestamp_idx" ON "Message"("senderId", "processed", "timestamp");

-- CreateIndex
CREATE INDEX "Message_processed_processingAt_idx" ON "Message"("processed", "processingAt");

-- CreateIndex
CREATE UNIQUE INDEX "Message_mid_senderId_key" ON "Message"("mid", "senderId");