import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { RegisterUseCase } from "../../application/use-cases/auth/RegisterUseCase";
import { BcryptPasswordHasher } from "../../infrastructure/auth/BcryptPasswordHasher";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { JwtTokenGenerator } from "../../infrastructure/auth/JwtTokenGenerator";

const authRouter = Router();
const bcryptPasswordHasher = new BcryptPasswordHasher
const prismaUserRepository = new PrismaUserRepository
const jwtTokenGenerator=new JwtTokenGenerator
const registerUseCase =
    new RegisterUseCase(
        bcryptPasswordHasher,
        prismaUserRepository,
        jwtTokenGenerator
    );
const authController = new AuthController(registerUseCase);

authRouter.post("/register", authController.register);

export default authRouter;
