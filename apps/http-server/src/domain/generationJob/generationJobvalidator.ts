import type { workspaceMemberData } from "@repo/types";
import { notAccessWorkspace, WorkspaceIdInvalidError } from "./generationJobError";

export class GenerationJobValidator {

  static validateCreateData(
    workspaceId: string
  ) {

    if (!workspaceId) {
      throw new WorkspaceIdInvalidError();
    }
  }

  static validatememberdata(data: workspaceMemberData|null) {
    if (!data) {
      throw new notAccessWorkspace()
    }
  }
}