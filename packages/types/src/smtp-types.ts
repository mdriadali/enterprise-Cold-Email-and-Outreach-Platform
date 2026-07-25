import { SmtpEncryption } from "@repo/db"

export interface SmtpCreateInputData {
    workspaceId: string,
    name: string,

    host: string,
    port: number,
    username: string,
    password: string,

    fromName: string,
    fromEmail: string,
    replyTo?: string,

    encryption: SmtpEncryption
}
export interface SmtpData {
    id: string,

    workspaceId: string,

    name: string,

    host: string,
    port: number,

    username: string,
    password: string,

    fromName: string,
    fromEmail: string,
    replyTo: string | null,
    encryption: SmtpEncryption,

    error: string | null
    isActive: boolean

    createdAt: Date


}

export interface SmtpUpdateData {
    name?: string;

    host?: string;
    port?: number;
    username?: string;
    password?: string;

    fromName?: string;
    fromEmail?: string;
    replyTo?: string;

    encryption?: SmtpEncryption;
}