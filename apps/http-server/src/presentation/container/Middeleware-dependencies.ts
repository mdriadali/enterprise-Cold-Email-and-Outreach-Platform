import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { WorkspaceMiddleware } from "../middlewares/WorkspaceMiddleware";
import { jwtTokenGenerator, prismaUserRepository, workspaceMemberRepository } from "./share-dependencies";

const authMiddleware = new AuthMiddleware(
    jwtTokenGenerator,
    prismaUserRepository,
)

export const Auth = authMiddleware.execute.bind(authMiddleware)

const workspacemiddleware=new WorkspaceMiddleware(
    workspaceMemberRepository
)

export const Workspace= workspacemiddleware.execute.bind(workspacemiddleware)