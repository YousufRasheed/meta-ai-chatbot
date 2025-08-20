import { PrismaClient } from "@prisma/client";

declare global {
    const prisma: PrismaClient | undefined;
}

// Configure Prisma with connection pooling and optimizations
const createPrismaClient = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
};

// @ts-expect-error Property 'prisma' does not exist on type 'typeof globalThis'.
export const db = globalThis.prisma || createPrismaClient();

// @ts-expect-error Property 'prisma' does not exist on type 'typeof globalThis'.
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

// Graceful shutdown handling
process.on('beforeExit', async () => {
    await db.$disconnect();
});
