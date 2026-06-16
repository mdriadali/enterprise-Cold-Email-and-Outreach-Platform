import { CreateWorkspaceUseCase } from "../../application/use-cases/workspace/createworkspace-useCase";
import { WorkspaceController } from "../controllers/WorkSpaceController";
import { workspaceMemberRepository, workspaceRepository } from "./share-dependencies";

const createWorkspaceUseCase = new CreateWorkspaceUseCase(
    workspaceRepository,
    workspaceMemberRepository
)
export const workspaceController = new WorkspaceController(createWorkspaceUseCase)