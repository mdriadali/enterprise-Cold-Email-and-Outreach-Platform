import type { GenerationJobData, leadInputdata } from "@repo/types";
import { generationJobIdInvalid } from "../sharedError";
import { LeadInvalid, notAcessGenerationJob } from "./leadError";

export class LeadValidator {
    static validateInputData(generationJobId: string, leadData: leadInputdata) {
        if (!generationJobId) {
            throw new generationJobIdInvalid()
        }
        if (!leadData) {
            throw new LeadInvalid()
        }
    }

    static validateJobAcess(jobData:GenerationJobData|null){
        if(!jobData){
            throw new notAcessGenerationJob()
        }
    }
}