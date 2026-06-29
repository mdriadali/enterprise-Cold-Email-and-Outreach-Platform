import type { GenerationJobData, leadInputdata } from "@repo/types";
import { generationJobIdInvalid } from "../sharedError";
import { LeadError, LeadInvalid, notAcessGenerationJob } from "./leadError";
import type { GenerationJobStatus } from "@repo/db";

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

    static isJobPending(status:GenerationJobStatus |null){
        if(status!=="PENDING"){
            throw new LeadError("This Email GenerationJob Already start Create a New Job")
        }
    }
}