import type { LeadData, leadInputdata } from "@repo/types";
import type { ILeadRepository } from "@repo/ports";
import { LeadStatus, Prisma, prismaClient } from "@repo/db";

export class PrismaLeadRepository implements ILeadRepository {
    async create(generationJobId: string, leadData: leadInputdata): Promise<LeadData> {
        const createLead = await prismaClient.lead.create({
            data: {
                generationJobId,
                email: leadData.email,
                metadata: leadData.metadata
            }
        })
        return createLead
    }
    async findPendingByJobId(jobId: string): Promise<LeadData[]> {
        const leads = await prismaClient.lead.findMany({
            where: {
                generationJobId: jobId,
                status: "PENDING"
            }
        });
        return leads
    }

    async updateGeneratedEmailData(id: string, data: Prisma.JsonObject): Promise<LeadData> {
        const update=await prismaClient.lead.update({
            where:{
                id
            },
            data:{
                generatedEmailData:data
            }
        })
        return update
    }

    async updateStatusById(id: string, status: LeadStatus, errorMassage?: string): Promise<LeadData> {
        const updatelead = await prismaClient.lead.update({
            where: {
                id
            },
            data: {
                status: status
            }
        })

        return updatelead
    }

    async createMany(generationJobId: string, leads: leadInputdata[]): Promise<number> {
        const uplodLeads = await prismaClient.lead.createMany({
            data: leads.map(lead => ({
                generationJobId,
                email: lead.email,
                metadata: lead.metadata
            }))
        })

        return uplodLeads.count
    }

    async findByStatus(jobId: string ,status: LeadStatus): Promise<LeadData[]> {
        const leads = await prismaClient.lead.findMany({
            where: {
                generationJobId: jobId,
                status: status
            }
        });
        return leads
    }
}