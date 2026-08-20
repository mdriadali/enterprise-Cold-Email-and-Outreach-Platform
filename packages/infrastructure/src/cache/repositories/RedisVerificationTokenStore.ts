import type { IVerificationTokenStore } from "@repo/ports";
import { redisConnection } from "@repo/queue";

export class RedisVerificationTokenStore implements IVerificationTokenStore {
    async set(key: string, token: string, ttlSeconds: number): Promise<void> {
        await redisConnection.set(key, token, "EX", ttlSeconds);
    }
    async get(key: string): Promise<string | null> {
        return await redisConnection.get(key);
    }
    async verify(key: string, token: string): Promise<boolean> {
        const stored = await redisConnection.get(key);
        return stored !== null && stored === token;
    }
    async delete(key: string): Promise<void> {
        await redisConnection.del(key);
    }
}
