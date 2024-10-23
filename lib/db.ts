import { PrismaClient } from "@prisma/client";

declare global {
    const prisma: PrismaClient | undefined;
}

// @ts-expect-error Property 'prisma' does not exist on type 'typeof globalThis'.
export const db = globalThis.prisma || new PrismaClient();

// @ts-expect-error Property 'prisma' does not exist on type 'typeof globalThis'.
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
