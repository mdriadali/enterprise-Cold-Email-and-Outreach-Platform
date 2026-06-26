import { generationQueue } from "@repo/queue";
import { GenerationJobValidator } from "../../../domain/generationJob/generationJobvalidator";
import type { IGenerationJobRepository } from "@repo/ports";


export class StartGenerationJobUseCase {
    constructor(
        private readonly generationJobRepository: IGenerationJobRepository
    ) { }
    async execute(userId: string, generationJobId: string) {
        GenerationJobValidator.validateGenerationId(generationJobId)
        const job = await this.generationJobRepository.findByidAndworkspaceMember(userId, generationJobId)
        GenerationJobValidator.validateUserAcessJob(job)

        const addQuue = await generationQueue.add(
            "job",
            {
                jobId: generationJobId
            }
        )
        return addQuue

    }
}