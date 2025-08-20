import { analyzeImages } from "./analyze-images";
import { generateFinalResponse } from "./generate-message-response";
import { sendFacebookMessage } from "./send-message";
import { messageProcessingService } from "./message-processing-service";
import { MessageForAI } from "@/types";

export async function processMessage(senderId: string, _timestamp: number): Promise<void> {
    try {
        // Wait 5 seconds to allow for message batching
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Acquire processing lock for unprocessed messages
        const lockedMessages = await messageProcessingService.acquireProcessingLock(senderId);
        
        if (lockedMessages.length === 0) {
            // No unprocessed messages or already being processed
            return;
        }

        try {
            // Get recent messages and conversation history efficiently
            const { textMessage, images } = await messageProcessingService.getRecentMessages(senderId);
            const recentMessages = await messageProcessingService.getConversationHistory(senderId);

            // Convert to AI format
            const conversationHistory: MessageForAI[] = recentMessages
                .map((msg): MessageForAI => ({
                    role: msg.isFromBot ? 'assistant' : 'user',
                    content: msg.text || '',
                }));

            // Get image analysis if there are images
            let imageAnalysis = "";
            if (images.length > 0) {
                imageAnalysis = await analyzeImages(images);
            }

            // Generate and send final response
            const finalResponse = await generateFinalResponse(
                textMessage?.text || undefined,
                imageAnalysis,
                conversationHistory
            );

            // Save bot's response to database
            await messageProcessingService.saveBotResponse(senderId, finalResponse);

            // Send message to Facebook
            await sendFacebookMessage(senderId, finalResponse);

            // Mark messages as processed
            await messageProcessingService.markAsProcessed(lockedMessages.map(m => m.id));

        } catch (processingError) {
            console.error('Error in message processing:', processingError);
            
            // Release locks on error
            await messageProcessingService.releaseLocks(lockedMessages.map(m => m.id));
            
            // Send error message to user
            await sendFacebookMessage(
                senderId,
                "I apologize, but I encountered an error while processing your message."
            );
            
            throw processingError;
        }

    } catch (error) {
        console.error('Error in delayed processing:', error);
    }
}
