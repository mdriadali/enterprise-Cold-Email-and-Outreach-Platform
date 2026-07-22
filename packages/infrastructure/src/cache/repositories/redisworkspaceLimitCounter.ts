import type { IWorkspaceLimitCounter } from "@repo/ports";
import type { WorkspaceLimitKey } from "@repo/ports/src/cache/repositories/IworkspaceLimitCounter";
import { redisConnection } from "@repo/queue";

export class RedisworkspaceLimitCounter implements IWorkspaceLimitCounter {
    async increment(workspaceId: string, key: WorkspaceLimitKey): Promise<number> {
        return await redisConnection.incr(`workspace:${workspaceId}:${key}`);
    }
    async decrement(workspaceId: string, key: WorkspaceLimitKey): Promise<number> {
        return await redisConnection.decr(`workspace:${workspaceId}:${key}`);
    }
    async get(workspaceId: string, key: WorkspaceLimitKey): Promise<number> {
        const value = await redisConnection.get(`workspace:${workspaceId}:${key}`);
        return Number(value ?? 0);
    }
    async reset(workspaceId: string, key: WorkspaceLimitKey): Promise<void> {
        await redisConnection.del(`workspace:${workspaceId}:${key}`)
    }
}