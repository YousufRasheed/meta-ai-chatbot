import { NextRequest } from "next/server";
import { analyzeImages } from "@/lib/analyze-images";
import { generateFinalResponse } from "@/lib/generate-message-response";
import { sendFacebookMessage } from "@/lib/send-message";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { senderId } = await req.json();

        // Get recent messages from this sender
        const recentMessages = await db.message.findMany({
            where: {
                senderId: senderId,
                timestamp: {
                    gte: BigInt(Date.now() - 5000) // Last 5 seconds
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 10 // Get last 2 messages to cover both text and attachments
        });

        // Find text and attachment messages
        const textMessage = recentMessages.find(msg => msg.text);
        const attachmentMessage = recentMessages.find(msg => msg.attachments);

        // Extract images from attachments if they exist
        const images = attachmentMessage?.attachments
            ?.filter((att: any) => att.type === 'image')
            .map((att: any) => att.payload.url) || [];

        // Get image analysis if there are images
        let imageAnalysis = "";
        if (images.length > 0) {
            imageAnalysis = await analyzeImages(images);
        }

        // Generate and send final response
        const finalResponse = await generateFinalResponse(textMessage?.text, imageAnalysis);
        await sendFacebookMessage(senderId, finalResponse);

        return new Response(null, { status: 200 });
    } catch (error) {
        console.error('Error processing message:', error);
        return new Response(null, { status: 500 });
    }
}
