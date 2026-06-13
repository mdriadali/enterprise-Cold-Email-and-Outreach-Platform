import { ProfileUseCase } from "../../application/use-cases/user/Profile-UseCase";
import { UserController } from "../controllers/UserController";
import { prismaUserRepository } from "./share-dependencies";


const profileUseCase = new ProfileUseCase(
    prismaUserRepository
)


export const userController = new UserController(
    profileUseCase
)