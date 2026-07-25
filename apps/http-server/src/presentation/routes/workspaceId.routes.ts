import { Router } from "express";
import aiApiRouter from "./aiapi.routes";
import generationJobRouter from "./generationJob.routes";
import smtpRouter from "./smtp.routes";
import { workspaceController } from "../container/workspacecontroller-dependencies";
import campaignRouter from "./campaign.routes";
import workspaceMemberRouter from "./workspaceMember.routes";

const workspaceIdRouter = Router()
workspaceIdRouter.get("/info",workspaceController.info)

workspaceIdRouter.use("/aiapi", aiApiRouter)
workspaceIdRouter.use("/generationjob", generationJobRouter)
workspaceIdRouter.use("/smtpaccount", smtpRouter)
workspaceIdRouter.use("/campaign",campaignRouter)
workspaceIdRouter.use("/member",workspaceMemberRouter)
export default workspaceIdRouter