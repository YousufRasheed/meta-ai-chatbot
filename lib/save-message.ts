import { db } from '@/lib/db';
import { MessagingEvent } from '@/types/facebook';
import { MessageType } from '@prisma/client';

export async function saveMessage(event: MessagingEvent) {
    const { sender, message, timestamp } = event;

    await db.message.create({
        data: {
            senderId: sender.id,
            text: message.text,
            attachments: message.attachments || null,
            timestamp: BigInt(timestamp),
            mid: message.mid,
            messageType: event.message.text ? MessageType.TEXT : MessageType.ATTACHMENT
        }
    });
}
