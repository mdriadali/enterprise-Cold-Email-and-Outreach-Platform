import { Router } from "express";
import { Auth } from "../container/authMiddeleware-dependencies";
import { authController } from "../container/authController-dependencies";


const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login)
authRouter.post("/logout", Auth, authController.logout)
authRouter.post("/refresh", authController.refresh)

export default authRouter;
