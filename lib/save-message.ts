import { db } from '@/lib/db';
import { MessagingEvent } from '@/types/facebook';

// Define MessageType enum locally
enum MessageType {
    TEXT = 'TEXT',
    ATTACHMENT = 'ATTACHMENT'
}

export async function saveMessage(event: MessagingEvent) {
    const { sender, message, timestamp } = event;

    try {
        await db.message.create({
            data: {
                senderId: sender.id,
                text: message.text,
                attachments: message.attachments || null,
                timestamp: BigInt(timestamp),
                mid: message.mid,
                messageType: message.text ? MessageType.TEXT : MessageType.ATTACHMENT,
                processed: false // New messages start as unprocessed
            }
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // Handle duplicate message gracefully (based on unique constraint)
        if (error?.code === 'P2002') {
            console.log(`Duplicate message detected for mid: ${message.mid}, senderId: ${sender.id}`);
            return; // Silently ignore duplicates
        }
        console.error('Error saving message:', error);
        throw error;
    }
}
