import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { SYSTEM_PROMPT } from "./ai-common";
import { MessageForAI } from "@/types";

export async function generateFinalResponse(
    text: string | undefined,
    imageAnalysis: string,
    conversationHistory: MessageForAI[]
): Promise<string> {
    const groq = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
    });

    console.log(JSON.stringify(conversationHistory, null, 2));

    // Construct the message for the language model
    let finalMessage = "";
    if (imageAnalysis) {
        finalMessage += "Image description: " + imageAnalysis + "\n\n";
    }
    if (text) {
        finalMessage += text;
    }

    try {
        const response = await generateText({
            model: groq("llama-3.1-70b-versatile"),
            system: SYSTEM_PROMPT,
            messages: [
                ...conversationHistory,
                {
                    role: "user",
                    content: finalMessage.trim(),
                }
            ],
            maxToolRoundtrips: 5,
            temperature: 1,
            maxTokens: 1024,
            maxRetries: 3,
        });

        return response.text;
    } catch (error) {
        console.error('Error generating response:', error);
        return "I apologize, but I encountered an error while processing your message.";
    }
}
