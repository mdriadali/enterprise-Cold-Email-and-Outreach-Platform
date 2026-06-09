import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { BcryptPasswordHasher } from "../../infrastructure/auth/BcryptPasswordHasher";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { JwtTokenGenerator } from "../../infrastructure/auth/JwtTokenGenerator";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUser-UseCase";
import { LoginUserUseCase } from "../../application/use-cases/auth/LoginUser-UseCase";

const authRouter = Router();
const bcryptPasswordHasher = new BcryptPasswordHasher
const prismaUserRepository = new PrismaUserRepository
const jwtTokenGenerator = new JwtTokenGenerator

const registerUseCase =
    new RegisterUserUseCase(
        bcryptPasswordHasher,
        prismaUserRepository,
        jwtTokenGenerator
    );

const loginUserUseCase = new LoginUserUseCase(
    prismaUserRepository,
    bcryptPasswordHasher,
    jwtTokenGenerator
)



const authController = new AuthController(registerUseCase, loginUserUseCase);

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login)

export default authRouter;
