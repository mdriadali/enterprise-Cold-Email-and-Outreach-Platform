import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { WorkspaceMiddleware } from "../middlewares/WorkspaceMiddleware";
import { AdminMiddleware } from "../middlewares/AdminMiddleware";
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

const adminmiddleware=new AdminMiddleware()

export const Admin= adminmiddleware.execute.bind(adminmiddleware)