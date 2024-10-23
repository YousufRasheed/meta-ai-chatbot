import { Message } from "@prisma/client";

export type DatabaseMessage = Message;

export interface MessageForAI {
    role: 'user' | 'assistant';
    content: string;
}
