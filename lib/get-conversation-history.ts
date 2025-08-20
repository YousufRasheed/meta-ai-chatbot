import { MessageForAI } from "@/types";
import { messageProcessingService } from "@/lib/message-processing-service";

export async function getConversationHistory(senderId: string): Promise<MessageForAI[]> {
    // Use the optimized service method
    const recentMessages = await messageProcessingService.getConversationHistory(senderId);

    const conversationHistory: MessageForAI[] = recentMessages
        .map((msg): MessageForAI => ({
            role: msg.isFromBot ? 'assistant' : 'user',
            content: msg.text || '',
        }));

    return conversationHistory;
}
