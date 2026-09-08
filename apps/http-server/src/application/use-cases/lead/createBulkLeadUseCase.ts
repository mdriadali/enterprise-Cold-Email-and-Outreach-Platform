import type { leadInputdata } from "@repo/types";

import { LeadValidator } from "../../../domain/lead/leadvalidator";
import { LeadError } from "../../../domain/lead/leadError";

import type { IGenerationJobRepository, ILeadRepository } from "@repo/ports";

export class CreateBulkLeadUseCase {

    constructor(
        private readonly generationJobRepository: IGenerationJobRepository,
        private readonly leadRepository: ILeadRepository
    ) { }

    async execute(
        userId: string,
        generationJobId: string,
        leads: leadInputdata[]
    ) {


        if (!Array.isArray(leads)) {
            throw new LeadError(
                "Leads must be an array"
            );
        }

        if (leads.length === 0) {
            throw new LeadError(
                "No leads provided"
            );
        }

        // Validate job access
        const job =
            await this.generationJobRepository
                .findByidAndworkspaceMember(
                    userId,
                    generationJobId
                );

        LeadValidator.validateJobAcess(job);
        LeadValidator.isJobPending(job?.status ?? null)

        // Validate every lead
        for (const lead of leads) {
            LeadValidator.validateInputData(
                generationJobId,
                lead
            );
        }



        // Bulk insert
        const createdLeads=await this.leadRepository.createMany(
            generationJobId,
            leads
        );

        await this.generationJobRepository.updateCounters(generationJobId,{totalLeads:createdLeads})

        return createdLeads
    }
}