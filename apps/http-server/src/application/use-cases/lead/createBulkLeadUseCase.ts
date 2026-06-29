import type { leadInputdata } from "@repo/types";

import { LeadValidator } from "../../../domain/lead/leadvalidator";

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
            throw new Error(
                "Leads must be an array"
            );
        }

        if (leads.length === 0) {
            throw new Error(
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
        return this.leadRepository.createMany(
            generationJobId,
            leads
        );
    }
}