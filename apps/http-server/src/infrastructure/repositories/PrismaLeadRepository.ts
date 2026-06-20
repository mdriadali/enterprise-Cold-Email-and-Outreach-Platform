import type { LeadData, leadInputdata } from "@repo/types";
import type { ILeadRepository } from "../../application/ports/repositories/LeadRepository-ports";
import { prismaClient } from "@repo/db";

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
}