import { LoginUserUseCase } from "../../application/use-cases/auth/LoginUser-UseCase";
import { LogoutUserUseCase } from "../../application/use-cases/auth/Logoutuser-useCase";
import { RefreshUseCase } from "../../application/use-cases/auth/Refresh-UseCase";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUser-UseCase";
import { AuthController } from "../controllers/AuthController";
import { bcryptPasswordHasher, jwtTokenGenerator, prismaRefreshToken, prismaUserRepository } from "./share-dependencies";

const registerUseCase =
    new RegisterUserUseCase(
        bcryptPasswordHasher,
        prismaUserRepository,
        jwtTokenGenerator,
        prismaRefreshToken
    );

const loginUserUseCase = new LoginUserUseCase(
    prismaUserRepository,
    bcryptPasswordHasher,
    jwtTokenGenerator,
    prismaRefreshToken
)
const logoutUserUseCase = new LogoutUserUseCase(
    prismaRefreshToken
)

const refreshUseCase = new RefreshUseCase(
    prismaRefreshToken,
    jwtTokenGenerator
)

export const  authController = new AuthController(registerUseCase, loginUserUseCase, logoutUserUseCase, refreshUseCase);