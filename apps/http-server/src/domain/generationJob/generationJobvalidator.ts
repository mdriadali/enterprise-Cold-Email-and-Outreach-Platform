import type { GenerationJobData, workspaceMemberData } from "@repo/types";
import { GenerationIdInvalidError, WorkspaceIdInvalidError } from "./generationJobError";
import { notAccess } from "../sharedError";

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
      throw new notAccess()
    }
  }

  static validateGenerationId(id: string | null) {
    if (!id) {
      throw new GenerationIdInvalidError()
    }
  }

  static validateUserAcessJob(data: GenerationJobData |null) {
    if (!data) {
      throw new notAccess()
    }
  }
}