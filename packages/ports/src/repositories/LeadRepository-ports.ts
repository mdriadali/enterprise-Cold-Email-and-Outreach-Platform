import type { LeadStatus, Prisma } from "@repo/db";
import type {LeadData, LeadEmailData, leadInputdata } from "@repo/types";

export interface ILeadRepository {
    create(generationJobId: string, leadData: leadInputdata): Promise<LeadData>
    findPendingByJobId(jobId: string): Promise<LeadData[]>
    findByJobIdAndWorkspaceId(jobId:string, workspaceId:string , page:number):Promise<LeadData[]>
    findAllEmailData(jobId:string, workspaceId:string ):Promise<LeadEmailData[]>


    updateGeneratedEmailData(id: string,  data: Prisma.JsonObject): Promise<LeadData>

    updateStatusById(id: string, status: LeadStatus, errorMassage?: string): Promise<LeadData>
    createMany(generationJobId: string, leads: leadInputdata[]): Promise<Number>
    findByStatus(jobId: string, status: LeadStatus): Promise<LeadData[]>

}