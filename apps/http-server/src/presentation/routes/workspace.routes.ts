import { Router } from "express";
import { workspaceController } from "../container/workspacecontroller-dependencies";
import { Auth, Workspace } from "../container/Middeleware-dependencies";
import workspaceIdRouter from "./workspaceId.routes";

const workspaceRouter = Router()

workspaceRouter.post("/create", Auth, workspaceController.create)


workspaceRouter.use("/:workspaceId", Auth ,Workspace,workspaceIdRouter)

export default workspaceRouter