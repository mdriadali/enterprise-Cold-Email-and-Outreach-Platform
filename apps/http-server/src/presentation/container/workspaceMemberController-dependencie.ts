import { AddMemberUseCase } from "../../application/use-cases/workspace/addMember-useCase";
import { WorkspaceMemberController } from "../controllers/workspaceMemberController";
import { prismaUserRepository, workspaceMemberRepository, workspaceRepository } from "./share-dependencies";


const addMemberUseCase=new AddMemberUseCase(workspaceRepository,workspaceMemberRepository,prismaUserRepository)
export const workspaceMemberController=new WorkspaceMemberController(addMemberUseCase)