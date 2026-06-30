import { Router } from "express";
import { Auth } from "../container/Middeleware-dependencies";
import { userController } from "../container/userController-dependencies";

const userRouter = Router()


userRouter.get("/profile", Auth, userController.profile)
userRouter.patch("/profile", Auth, userController.profileUpdate)

export default userRouter