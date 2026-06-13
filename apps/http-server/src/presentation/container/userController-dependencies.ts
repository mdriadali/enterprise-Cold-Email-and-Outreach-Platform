import { ProfileUseCase } from "../../application/use-cases/user/Profile-UseCase";
import { ProfileUpdateUseCase } from "../../application/use-cases/user/ProfileUpdate-useCase";
import { UserController } from "../controllers/UserController";
import { prismaUserRepository } from "./share-dependencies";


const profileUseCase = new ProfileUseCase(
    prismaUserRepository
)

const profileUpdateUseCase=new ProfileUpdateUseCase(
    prismaUserRepository
)


export const userController = new UserController(
    profileUseCase,
    profileUpdateUseCase
)