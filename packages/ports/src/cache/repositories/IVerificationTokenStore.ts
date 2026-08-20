export interface IVerificationTokenStore {
    set(key: string, token: string, ttlSeconds: number): Promise<void>;
    get(key: string): Promise<string | null>;
    verify(key: string, token: string): Promise<boolean>;
    delete(key: string): Promise<void>;
}
