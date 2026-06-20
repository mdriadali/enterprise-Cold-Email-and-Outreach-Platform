import type { LeadData, leadInputdata } from "@repo/types";

export interface ILeadRepository{
    create(generationJobId: string, leadData: leadInputdata):Promise<LeadData>
}