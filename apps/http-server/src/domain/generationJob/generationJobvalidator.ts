import type { GenerationJobData, workspaceMemberData } from "@repo/types";
import { GenerationError, WorkspaceIdInvalidError } from "./generationJobError";
import { notAccess } from "../sharedError";
import { GenerationJobStatus } from "@repo/db";

export class GenerationJobValidator {

  static validateCreateData(
    workspaceId: string
  ) {

    if (!workspaceId) {
      throw new WorkspaceIdInvalidError();
    }
  }

  static validatememberdata(data: workspaceMemberData | null) {
    if (!data) {
      throw new notAccess("Workspace Or This Member Not Exist ")
    }
  }

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
}