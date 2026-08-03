import { GenerationJobStatus } from "@repo/db";

export class UpdateStatusGenerationJobUseCase {
    constructor(

    ) { }
    async execute(workspaceId: string, jobId: string, status: GenerationJobStatus) {
        switch (status) {

            case GenerationJobStatus.PAUSED:
                return
            
                
            //  case GenerationJobStatus.   

        }
    }
}