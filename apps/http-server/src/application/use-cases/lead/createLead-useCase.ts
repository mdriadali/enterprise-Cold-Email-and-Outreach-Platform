import type { leadInputdata } from "@repo/types";
import { LeadValidator } from "../../../domain/lead/leadvalidator";
import type { IGenerationJobRepository, ILeadRepository } from "@repo/ports";


export class CreateLeadUseCase {
    constructor(
        private readonly generationJobRepository: IGenerationJobRepository,
        private readonly leadRepository: ILeadRepository
    ) { }
    async execute(userId: string, generationJobId: string, leadData: leadInputdata) {
        LeadValidator.validateInputData(generationJobId, leadData)

        const job = await this.generationJobRepository.findByidAndworkspaceMember(userId, generationJobId)

        LeadValidator.validateJobAcess(job)
        LeadValidator.isJobPending(job?.status??null)

        const createLead = await this.leadRepository.create(generationJobId, leadData)
        return createLead
    }
}