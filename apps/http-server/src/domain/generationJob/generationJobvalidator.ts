import type { GenerationJobData, workspaceMemberData } from "@repo/types";
import { GenerationError, WorkspaceIdInvalidError } from "./generationJobError";
import { BadRequestError, notAccess } from "../sharedError";
import { GenerationJobStatus } from "@repo/db";

export class GenerationJobValidator {



  static validateGenerationId(id: string | null) {
    if (!id) {
      throw new GenerationError("Generation Id Invalid")
    }
  }


  static isGenerationJobExist(data:GenerationJobData|null){
    if(!data){
      throw new GenerationError("This Email Generation Job Not Exist")
    }
  }

  static jobCanStart(status:GenerationJobStatus |null){
    if(status==="PROCESSING"){
      console.log("This Email Genaration Job Already Processing")
      throw new GenerationError("This Email Genaration Job Already Processing")
    }
    if(status==="COMPLETED"){
      throw new GenerationError("This Email Genaration Job Already Completed")
    }
  }

  static  validateJobLimit(limitJob: number, Jobcount: number) {
          if (Jobcount >= limitJob) {
              throw new BadRequestError("Your plan Generation Job  limit has been reached.")
          }
      }
  
}