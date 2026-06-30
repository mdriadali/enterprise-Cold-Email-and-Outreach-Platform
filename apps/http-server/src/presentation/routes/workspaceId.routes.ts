import { Router } from "express";
import aiApiRouter from "./aiapi.routes";
import generationJobRouter from "./generationJob.routes";
import leadRouter from "./lead.routes";
import smtpRouter from "./smtp.routes";

const workspaceIdRouter = Router()
workspaceIdRouter.use("/aiapi", aiApiRouter)
workspaceIdRouter.use("/generationjob", generationJobRouter)
workspaceIdRouter.use("/smtp", smtpRouter)
export default workspaceIdRouter