import { db } from "@/lib/db";
import { DatabaseMessage } from "@/types";
import { FacebookAttachment } from "@/types/facebook";

// Define MessageType enum locally to avoid Prisma client dependency issues
enum MessageType {
    TEXT = 'TEXT',
    ATTACHMENT = 'ATTACHMENT'
}

export class MessageProcessingService {
    private static instance: MessageProcessingService;
    private processingInstance: string;

    private constructor() {
        // Create a unique instance identifier
        this.processingInstance = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    static getInstance(): MessageProcessingService {
        if (!MessageProcessingService.instance) {
            MessageProcessingService.instance = new MessageProcessingService();
        }
        return MessageProcessingService.instance;
    }

    /**
     * Acquire a processing lock for unprocessed messages
     * This prevents race conditions by using database-level locking
     */
    async acquireProcessingLock(senderId: string, timeWindow: number = 10000): Promise<DatabaseMessage[]> {
        const cutoffTime = BigInt(Date.now() - timeWindow);
        const lockTimeout = new Date(Date.now() + 5 * 60 * 1000); // 5 minute timeout

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await db.$transaction(async (tx: any) => {
            // Find unprocessed messages from this sender within the time window
            const unprocessedMessages = await tx.message.findMany({
                where: {
                    senderId: senderId,
                    timestamp: {
                        gte: cutoffTime
                    },
                    processed: false,
                    OR: [
                        { processingAt: null },
                        { processingAt: { lt: new Date(Date.now() - 5 * 60 * 1000) } } // Stale locks older than 5 minutes
                    ]
                },
                orderBy: {
                    timestamp: 'desc'
                },
                take: 10
            });

            if (unprocessedMessages.length === 0) {
                return [];
            }

            // Acquire locks on these messages
            await tx.message.updateMany({
                where: {
                    id: { in: unprocessedMessages.map((m: DatabaseMessage) => m.id) }
                },
                data: {
                    processingAt: lockTimeout,
                    processingBy: this.processingInstance
                }
            });

            return unprocessedMessages;
        });
    }

    /**
     * Mark messages as processed and release locks
     */
    async markAsProcessed(messageIds: string[]): Promise<void> {
        await db.message.updateMany({
            where: {
                id: { in: messageIds },
                processingBy: this.processingInstance
            },
            data: {
                processed: true,
                processingAt: null,
                processingBy: null
            }
        });
    }

    /**
     * Release locks without marking as processed (in case of error)
     */
    async releaseLocks(messageIds: string[]): Promise<void> {
        await db.message.updateMany({
            where: {
                id: { in: messageIds },
                processingBy: this.processingInstance
            },
            data: {
                processingAt: null,
                processingBy: null
            }
        });
    }

    /**
     * Get conversation history efficiently with proper indexing
     */
    async getConversationHistory(senderId: string, limit: number = 20): Promise<DatabaseMessage[]> {
        return await db.message.findMany({
            where: {
                senderId: senderId,
                text: {
                    not: null,
                },
                messageType: MessageType.TEXT,
                processed: true // Only include successfully processed messages
            },
            orderBy: {
                timestamp: 'asc'
            },
            take: limit,
        });
    }

    /**
     * Get recent messages with optimized query
     */
    async getRecentMessages(senderId: string, timeWindow: number = 10000): Promise<{
        textMessage?: DatabaseMessage;
        attachmentMessage?: DatabaseMessage;
        images: string[];
    }> {
        const cutoffTime = BigInt(Date.now() - timeWindow);
        
        // Single optimized query to get both text and attachment messages
        const recentMessages = await db.message.findMany({
            where: {
                senderId: senderId,
                timestamp: {
                    gte: cutoffTime
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 10
        });

        const textMessage = recentMessages.find((msg: DatabaseMessage) => msg.text && msg.messageType === MessageType.TEXT);
        const attachmentMessage = recentMessages.find((msg: DatabaseMessage) => msg.attachments);

        // Extract images with proper typing
        const attachments = attachmentMessage?.attachments as FacebookAttachment[] | undefined;
        const images = attachments
            ?.filter((att: FacebookAttachment) => att.type === 'image')
            .map((att: FacebookAttachment) => att.payload.url) || [];

        return { textMessage, attachmentMessage, images };
    }

    /**
     * Save bot response with proper error handling
     */
    async saveBotResponse(senderId: string, text: string): Promise<void> {
        await db.message.create({
            data: {
                senderId: senderId,
                text: text,
                timestamp: BigInt(Date.now()),
                isFromBot: true,
                messageType: MessageType.TEXT,
                processed: true // Bot messages are immediately processed
            }
        });
    }

    /**
     * Cleanup stale processing locks (should be called periodically)
     */
    async cleanupStaleLocks(): Promise<void> {
        const staleTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
        
        await db.message.updateMany({
            where: {
                processingAt: {
                    lt: staleTime
                },
                processed: false
            },
            data: {
                processingAt: null,
                processingBy: null
            }
        });
    }
}

export const messageProcessingService = MessageProcessingService.getInstance();