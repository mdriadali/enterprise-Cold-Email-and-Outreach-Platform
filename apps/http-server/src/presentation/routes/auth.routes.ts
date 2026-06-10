import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { BcryptPasswordHasher } from "../../infrastructure/auth/BcryptPasswordHasher";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { JwtTokenGenerator } from "../../infrastructure/auth/JwtTokenGenerator";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUser-UseCase";
import { LoginUserUseCase } from "../../application/use-cases/auth/LoginUser-UseCase";
import { PrismaRefreshToken } from "../../infrastructure/repositories/PrismaRefreshToken";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { LogoutUserUseCase } from "../../application/use-cases/auth/Logoutuser-useCase";

const authRouter = Router();
const bcryptPasswordHasher = new BcryptPasswordHasher
const prismaUserRepository = new PrismaUserRepository
const jwtTokenGenerator = new JwtTokenGenerator
const prismaRefreshToken = new PrismaRefreshToken


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

const authMiddleware = new AuthMiddleware(
    jwtTokenGenerator,
    prismaUserRepository,
)



const authController = new AuthController(registerUseCase, loginUserUseCase, logoutUserUseCase);

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login)
authRouter.post("/logout", authMiddleware.execute.bind(authMiddleware), authController.logout)

export default authRouter;
