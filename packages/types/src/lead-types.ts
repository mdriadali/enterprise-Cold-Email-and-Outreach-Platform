import type { LeadStatus, Prisma } from "@repo/db";

export interface leadInputdata {
    email: string,
    metadata: Prisma.InputJsonValue
}
export interface LeadData {
    id: string
    generationJobId: string

    email: string

    metadata: Prisma.JsonValue

    status: LeadStatus

    generatedEmailData?: Prisma.JsonValue | null;
    createdAt: Date
    updatedAt: Date
}

export interface FindAllLeadInputdata {
    workspaceId: string,
    generationJobId: string,
    page: number
}

export interface LeadEmailData {
    email: string;
    subject: string;
    greeting:string
    body: string;
    signature?: string;
}