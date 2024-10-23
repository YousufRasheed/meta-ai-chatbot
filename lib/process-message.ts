import { db } from "@/lib/db";
import { analyzeImages } from "./analyze-images";
import { generateFinalResponse } from "./generate-message-response";
import { sendFacebookMessage } from "./send-message";
import { FacebookAttachment } from "@/types/facebook";
import { Message as DatabaseMessage, MessageType } from '@prisma/client';
import { getConversationHistory } from "./get-conversation-history";

export async function processMessage(senderId: string, timestamp: number): Promise<void> {
    try {
        // Wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Get recent messages from this sender
        const recentMessages = await db.message.findMany({
            where: {
                senderId: senderId,
                timestamp: {
                    gte: BigInt(timestamp - 10000) // Last 10 seconds
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 2
        });

        const textMessage = recentMessages.find((msg: DatabaseMessage) => msg.text);
        const attachmentMessage = recentMessages.find((msg: DatabaseMessage) => msg.attachments);

        // Extract images from attachments if they exist
        const attachments = attachmentMessage?.attachments as FacebookAttachment[] | undefined;
        const images = attachments
            ?.filter(att => att.type === 'image')
            .map(att => att.payload.url) || [];

        // Get image analysis if there are images
        let imageAnalysis = "";
        if (images.length > 0) {
            imageAnalysis = await analyzeImages(images);
        }

        // Get conversation history
        const conversationHistory = await getConversationHistory(senderId);

        // Generate and send final response
        const finalResponse = await generateFinalResponse(
            textMessage?.text,
            imageAnalysis,
            conversationHistory
        );

        // Save bot's response to database
        await db.message.create({
            data: {
                senderId: senderId,
                text: finalResponse,
                timestamp: BigInt(Date.now()),
                isFromBot: true,
                messageType: MessageType.TEXT
            }
        });

        await sendFacebookMessage(senderId, finalResponse);

    } catch (error) {
        console.error('Error in delayed processing:', error);
        await sendFacebookMessage(
            senderId,
            "I apologize, but I encountered an error while processing your message."
        );
    }
}
