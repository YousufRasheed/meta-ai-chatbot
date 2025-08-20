import { messageProcessingService } from "@/lib/message-processing-service";

/**
 * Cleanup service to handle stale processing locks
 * This should be called periodically (e.g., via cron job or background task)
 */
export class CleanupService {
    private static cleanupInterval: NodeJS.Timeout | null = null;

    /**
     * Start the cleanup service to run periodically
     */
    static start(intervalMinutes: number = 10): void {
        if (CleanupService.cleanupInterval) {
            return; // Already running
        }

        CleanupService.cleanupInterval = setInterval(async () => {
            try {
                console.log('Running cleanup of stale processing locks...');
                await messageProcessingService.cleanupStaleLocks();
                console.log('Cleanup completed successfully');
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        }, intervalMinutes * 60 * 1000);

        console.log(`Cleanup service started, running every ${intervalMinutes} minutes`);
    }

    /**
     * Stop the cleanup service
     */
    static stop(): void {
        if (CleanupService.cleanupInterval) {
            clearInterval(CleanupService.cleanupInterval);
            CleanupService.cleanupInterval = null;
            console.log('Cleanup service stopped');
        }
    }

    /**
     * Run cleanup manually
     */
    static async runOnce(): Promise<void> {
        try {
            console.log('Running manual cleanup...');
            await messageProcessingService.cleanupStaleLocks();
            console.log('Manual cleanup completed successfully');
        } catch (error) {
            console.error('Error during manual cleanup:', error);
            throw error;
        }
    }
}

// Auto-start cleanup service in production
if (process.env.NODE_ENV === 'production') {
    CleanupService.start(10); // Run every 10 minutes
}