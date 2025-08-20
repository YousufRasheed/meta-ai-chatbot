// Define the Message type locally to avoid Prisma client dependency issues
export type DatabaseMessage = {
    id: string;
    senderId: string;
    messageType: 'TEXT' | 'ATTACHMENT';
    mid: string | null;
    text: string | null;
    attachments: any | null; // JSON field
    timestamp: bigint;
    createdAt: Date;
    isFromBot: boolean;
    processed: boolean;
    processingAt: Date | null;
    processingBy: string | null;
};

export interface MessageProcessingLock {
    id: string;
    processingBy: string;
    processingAt: Date;
}

export interface MessageForAI {
    role: 'user' | 'assistant';
    content: string;
}
