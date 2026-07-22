
export type WorkspaceLimitKey =
    | "members"
    | "generationJobs"
    | "campaigns"
    | "apiKeys"
    | "smtpAccounts"
    | "mailSentDaily";


export interface IWorkspaceLimitCounter {
    increment(workspaceId: string, key: WorkspaceLimitKey): Promise<number>;
    decrement(workspaceId: string, key: WorkspaceLimitKey): Promise<number>;
    get(workspaceId: string, key: WorkspaceLimitKey): Promise<number>;
    reset(workspaceId: string, key: WorkspaceLimitKey): Promise<void>;
}