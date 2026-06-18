import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import workspaceRouter from "./workspace.routes";
import aiApiRouter from "./aiapi.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/user",userRouter);
router.use("/workspace",workspaceRouter)
router.use("/aiapi",aiApiRouter)

export default router;