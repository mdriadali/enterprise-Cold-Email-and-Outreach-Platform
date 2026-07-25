import { AddMemberUseCase } from "../../application/use-cases/workspace/addMember-useCase";
import { DeleteMemberUseCase } from "../../application/use-cases/workspace/deleteMember-useCase";
import { WorkspaceMemberController } from "../controllers/workspaceMemberController";
import { prismaUserRepository, workspaceMemberRepository, workspaceRepository } from "./share-dependencies";


const addMemberUseCase=new AddMemberUseCase(workspaceRepository,workspaceMemberRepository,prismaUserRepository)


const deleteMemberUseCase=new DeleteMemberUseCase(workspaceRepository,workspaceMemberRepository)

export const workspaceMemberController=new WorkspaceMemberController(addMemberUseCase,deleteMemberUseCase)