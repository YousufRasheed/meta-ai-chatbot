import { processMessage } from "@/lib/process-message";
import { saveMessage } from "@/lib/save-message";
import { WebhookEvent } from "@/types/facebook";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);

    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === process.env.FACEBOOK_VERIFICATION_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            return new Response(challenge, {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8'
                }
            })
        } else {
            return NextResponse.json({ message: "Token does not match." }, { status: 403 })
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const body: WebhookEvent = await req.json();

        if (body.object === 'page') {
            for (const entry of body.entry) {
                const event = entry.messaging[0];

                // Save message first
                await saveMessage(event);

                // If it's a text message, trigger processing asynchronously
                if (event.message.text) {
                    processMessage(event.sender.id, event.timestamp).catch(console.error);
                }
            }

            // Respond to Facebook immediately
            return new Response(null, { status: 200 });
        }
        return new Response(null, { status: 404 });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(null, { status: 500 });
    }
}
