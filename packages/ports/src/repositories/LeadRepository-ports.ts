import type { LeadStatus, Prisma } from "@repo/db";
import type {LeadData, leadInputdata } from "@repo/types";

export interface ILeadRepository {
    create(generationJobId: string, leadData: leadInputdata): Promise<LeadData>
    findPendingByJobId(jobId: string): Promise<LeadData[]>

    updateGeneratedEmailData(id: string,  data: Prisma.JsonObject): Promise<LeadData>

    updateStatusById(id: string, status: LeadStatus, errorMassage?: string): Promise<LeadData>
    createMany(generationJobId: string, leads: leadInputdata[]): Promise<Number>
    findByStatus(jobId: string, status: LeadStatus): Promise<LeadData[]>

}