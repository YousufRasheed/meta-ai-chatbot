import { NextRequest } from "next/server";
import { CleanupService } from "@/lib/cleanup-service";

export async function POST(req: NextRequest) {
    try {
        // Add basic authentication/authorization here if needed
        const authHeader = req.headers.get('authorization');
        if (!authHeader || authHeader !== `Bearer ${process.env.CLEANUP_API_KEY}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        await CleanupService.runOnce();
        return new Response(JSON.stringify({ success: true, message: 'Cleanup completed' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Cleanup API error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Cleanup failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}