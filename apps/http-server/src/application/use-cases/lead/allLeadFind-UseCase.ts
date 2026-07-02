import type { FindAllLeadInputdata } from "@repo/types";
import { LeadValidator } from "../../../domain/lead/leadvalidator";
import type { ILeadRepository } from "@repo/ports";

export class AllLeadFindUseCase {
    constructor(
        private readonly leadRepository: ILeadRepository
    ) { }
    async execute(data: FindAllLeadInputdata) {
        LeadValidator.validateFindAllLeadInputdata(data)
        const leads = await this.leadRepository.findByJobIdAndWorkspaceId(data.generationJobId, data.workspaceId, data.page)

        LeadValidator.validateFindAllLeadOutputData(leads)
        return leads
    }
}