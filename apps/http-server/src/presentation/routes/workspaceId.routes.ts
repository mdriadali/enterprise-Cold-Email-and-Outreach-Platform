import { Router } from "express";
import aiApiRouter from "./aiapi.routes";
import generationJobRouter from "./generationJob.routes";
import smtpRouter from "./smtp.routes";
import { workspaceController } from "../container/workspacecontroller-dependencies";

const workspaceIdRouter = Router()
workspaceIdRouter.get("/info",workspaceController.info)

workspaceIdRouter.use("/aiapi", aiApiRouter)
workspaceIdRouter.use("/generationjob", generationJobRouter)
workspaceIdRouter.use("/smtpaccount", smtpRouter)
export default workspaceIdRouter