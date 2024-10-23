import { DatabaseMessage, MessageForAI } from "@/types";
import { db } from "@/lib/db";
import { MessageType } from "@prisma/client";

export async function getConversationHistory(senderId: string): Promise<MessageForAI[]> {
    // Get recent messages, only pure text messages
    const recentMessages = await db.message.findMany({
        where: {
            senderId: senderId,
            text: {
                not: null,
            },
            messageType: MessageType.TEXT,
        },
        orderBy: {
            timestamp: 'asc'  // Changed from 'desc' to 'asc'
        },
        take: 20,
    });

    const conversationHistory: MessageForAI[] = recentMessages
        .map((msg: DatabaseMessage): MessageForAI => ({
            role: msg.isFromBot ? 'assistant' : 'user',
            content: msg.text || '',
        }));

    return conversationHistory;
}
