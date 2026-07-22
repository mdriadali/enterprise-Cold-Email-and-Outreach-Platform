import { CreateWorkspaceUseCase } from "../../application/use-cases/workspace/createworkspace-useCase";
import { GetWorkspaceInfoUseCase } from "../../application/use-cases/workspace/getworkspaceinfo-usecase";
import { WorkspaceController } from "../controllers/WorkSpaceController";
import { prismaUserRepository, workspaceMemberRepository, workspaceRepository } from "./share-dependencies";

const createWorkspaceUseCase = new CreateWorkspaceUseCase(
    workspaceRepository,
    workspaceMemberRepository,
    prismaUserRepository,
)

const getWorkspaceInfoUseCase=new GetWorkspaceInfoUseCase(
    workspaceRepository
)

export const workspaceController = new WorkspaceController(createWorkspaceUseCase,getWorkspaceInfoUseCase)