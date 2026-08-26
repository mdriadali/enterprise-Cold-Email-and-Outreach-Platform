import { LoginUserUseCase } from "../../application/use-cases/auth/LoginUser-UseCase";
import { LogoutUserUseCase } from "../../application/use-cases/auth/Logoutuser-useCase";
import { RefreshUseCase } from "../../application/use-cases/auth/Refresh-UseCase";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUser-UseCase";
import { VerifyEmailUseCase } from "../../application/use-cases/auth/VerifyEmail-UseCase";
import { ForgotPasswordUseCase } from "../../application/use-cases/auth/ForgotPassword-UseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/auth/ResetPassword-UseCase";
import { ResendVerificationEmailUseCase } from "../../application/use-cases/auth/ResendVerificationEmail-UseCase";
import { AuthController } from "../controllers/AuthController";
import { appUrl, authEmailQueue, bcryptPasswordHasher, jwtTokenGenerator, prismaRefreshToken, prismaUserRepository, verificationTokenStore } from "./share-dependencies";

const registerUseCase =
    new RegisterUserUseCase(
        bcryptPasswordHasher,
        prismaUserRepository,
        jwtTokenGenerator,
        prismaRefreshToken,
        verificationTokenStore,
        authEmailQueue,
        appUrl
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

const verifyEmailUseCase = new VerifyEmailUseCase(
    prismaUserRepository,
    verificationTokenStore
)

const forgotPasswordUseCase = new ForgotPasswordUseCase(
    prismaUserRepository,
    verificationTokenStore,
    authEmailQueue,
    appUrl
)

const resetPasswordUseCase = new ResetPasswordUseCase(
    prismaUserRepository,
    bcryptPasswordHasher,
    verificationTokenStore
)

const resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
    prismaUserRepository,
    verificationTokenStore,
    authEmailQueue,
    appUrl
)

export const  authController = new AuthController(registerUseCase, loginUserUseCase, logoutUserUseCase, refreshUseCase, verifyEmailUseCase, forgotPasswordUseCase, resetPasswordUseCase, resendVerificationEmailUseCase);
