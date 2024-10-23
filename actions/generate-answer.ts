import { SYSTEM_PROMPT } from "@/lib/ai-common";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function generateAnswer(newMessage: string) {
    const groq = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
    });

    const res = await generateText({
        model: groq("llama-3.1-70b-versatile"),
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: "user",
                content: newMessage,
            }
        ],
        maxToolRoundtrips: 5,
        temperature: 1,
        maxTokens: 1024,
        maxRetries: 3,
    });

    return res.text;
}
