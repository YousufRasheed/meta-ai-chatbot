# Database Schema and Performance Improvements

## Overview

This document outlines the improvements made to the meta-ai-chatbot database schema and data fetching patterns to prevent N+1 queries, race conditions, and improve overall performance.

## Issues Addressed

### 1. Race Conditions
- **Problem**: Multiple concurrent webhook requests could process the same message multiple times
- **Solution**: Added database-level locking with processing status fields

### 2. N+1 Queries
- **Problem**: Multiple separate database queries for the same operations
- **Solution**: Consolidated queries and created optimized service layer

### 3. Data Fetching Inefficiencies
- **Problem**: Duplicate code, inefficient queries, no connection pooling
- **Solution**: Created centralized service with optimized queries and proper connection handling

## Database Schema Changes

### New Fields Added to Message Model
```sql
ALTER TABLE "Message" ADD COLUMN "processed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Message" ADD COLUMN "processingAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN "processingBy" TEXT;
```

### New Indexes for Performance
```sql
-- Optimize queries for unprocessed messages by sender
CREATE INDEX "Message_senderId_processed_timestamp_idx" ON "Message"("senderId", "processed", "timestamp");

-- Cleanup stale processing locks
CREATE INDEX "Message_processed_processingAt_idx" ON "Message"("processed", "processingAt");

-- Prevent duplicate message processing
CREATE UNIQUE INDEX "Message_mid_senderId_key" ON "Message"("mid", "senderId");
```

## New Services

### MessageProcessingService
- **Purpose**: Centralized service for all message processing operations
- **Features**:
  - Database-level locking to prevent race conditions
  - Optimized queries to reduce database load
  - Transaction-based operations for data consistency
  - Automatic cleanup of stale locks

### CleanupService
- **Purpose**: Background service to clean up stale processing locks
- **Features**:
  - Automatic periodic cleanup (runs every 10 minutes in production)
  - Manual cleanup API endpoint
  - Prevents database bloat from failed processing attempts

## Key Improvements

### 1. Race Condition Prevention
```typescript
// Before: No protection against concurrent processing
await processMessage(senderId, timestamp);

// After: Database-level locking
const lockedMessages = await messageProcessingService.acquireProcessingLock(senderId);
// Process messages with exclusive lock
await messageProcessingService.markAsProcessed(messageIds);
```

### 2. Query Optimization
```typescript
// Before: Multiple separate queries
const textMessage = await db.message.findMany(/* query 1 */);
const attachmentMessage = await db.message.findMany(/* query 2 */);
const conversationHistory = await db.message.findMany(/* query 3 */);

// After: Single optimized service call
const { textMessage, images } = await messageProcessingService.getRecentMessages(senderId);
const conversationHistory = await messageProcessingService.getConversationHistory(senderId);
```

### 3. Error Handling
- Added graceful duplicate message handling
- Proper transaction rollback on errors
- Lock release on processing failures

## Deployment Instructions

### 1. Run Database Migration
```bash
npx prisma migrate dev --name add_processing_fields_and_indexes
```

### 2. Generate Updated Prisma Client
```bash
npx prisma generate
```

### 3. Environment Variables
Add to your `.env` file:
```
CLEANUP_API_KEY=your-secret-cleanup-key
```

### 4. Verify Build
```bash
npm run build
npm run lint
```

### 5. Deploy Application
Deploy as usual - the cleanup service will automatically start in production.

## API Endpoints

### Cleanup API
- **Endpoint**: `POST /api/cleanup`
- **Authorization**: Bearer token (CLEANUP_API_KEY)
- **Purpose**: Manually trigger cleanup of stale processing locks

## Monitoring

### Database Monitoring
Monitor these metrics:
- Average query execution time for message operations
- Number of messages in processing state
- Frequency of duplicate message attempts

### Application Monitoring
- Processing lock timeouts
- Failed message processing attempts
- Cleanup service execution frequency

## Performance Benefits

### Query Performance
- **Before**: 3-5 separate queries per message processing
- **After**: 1-2 optimized queries with proper indexes

### Race Condition Prevention
- **Before**: Possible duplicate processing under high load
- **After**: Database-level locks prevent all race conditions

### Memory Usage
- **Before**: No connection pooling, potential memory leaks
- **After**: Proper connection management and cleanup

## Testing

### Manual Testing
1. Send multiple messages quickly to test race condition prevention
2. Monitor database for duplicate processing
3. Verify cleanup service removes stale locks

### Load Testing
1. Send concurrent webhook requests
2. Verify no duplicate responses
3. Monitor database performance under load

## Rollback Plan

If issues occur, you can rollback by:
1. Reverting the database migration
2. Deploying the previous version
3. The old code will continue to work without the new fields

## Maintenance

### Regular Tasks
- Monitor stale lock cleanup logs
- Review processing performance metrics
- Verify index usage in query plans

### Emergency Procedures
- Manual cleanup endpoint for stuck processing
- Database query to release all locks if needed:
```sql
UPDATE "Message" SET "processingAt" = NULL, "processingBy" = NULL, "processed" = false 
WHERE "processingAt" < NOW() - INTERVAL '10 minutes';
```

## Security Considerations

- Cleanup API requires authentication
- Processing instance IDs prevent cross-instance interference
- Database transactions ensure data consistency
- Unique constraints prevent data corruption