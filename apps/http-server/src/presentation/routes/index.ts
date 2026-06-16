import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import workspaceRouter from "./workspace.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/user",userRouter);
router.use("/workspace",workspaceRouter)

export default router;