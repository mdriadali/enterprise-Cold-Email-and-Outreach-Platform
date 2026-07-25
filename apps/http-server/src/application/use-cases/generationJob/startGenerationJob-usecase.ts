import { generationQueue } from "@repo/queue";
import { GenerationJobValidator } from "../../../domain/generationJob/generationJobvalidator";
import type { IGenerationJobRepository } from "@repo/ports";


export class StartGenerationJobUseCase {
    constructor(
        private readonly generationJobRepository: IGenerationJobRepository
    ) { }
    async execute(workspaceId: string, generationJobId: string) {
        GenerationJobValidator.validateGenerationId(generationJobId)
        const job = await this.generationJobRepository.findByIdWorkspaceId(generationJobId, workspaceId)
        GenerationJobValidator.isGenerationJobExist(job)

        GenerationJobValidator.jobCanStart(job!.status)

        const addQuue = await generationQueue.add(
            "job",
            {
                jobId: generationJobId
            }
        )
        return addQuue

    }
     status = async (req: Request, res: Response) => {
        try {

             const workspaceId = req.workspaceMember?.workspaceId
            const { jobId, status } = req.params;
 
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[GenerationJob Start] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
  
}