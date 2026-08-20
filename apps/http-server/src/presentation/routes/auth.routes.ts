import { Router } from "express";
import { Auth } from "../container/Middeleware-dependencies";
import { authController } from "../container/authController-dependencies";


const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login)
authRouter.post("/logout", Auth, authController.logout)
authRouter.post("/refresh", authController.refresh)
authRouter.post("/verify-email", authController.verifyEmail)
authRouter.post("/forgot-password", authController.forgotPassword)
authRouter.post("/reset-password", authController.resetPassword)

export default authRouter;
