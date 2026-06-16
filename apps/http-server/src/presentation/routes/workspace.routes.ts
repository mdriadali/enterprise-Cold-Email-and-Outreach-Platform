import { Router } from "express";
import { workspaceController } from "../container/workspacecontroller-dependencies";
import { Auth } from "../container/authMiddeleware-dependencies";

const workspaceRouter=Router()

workspaceRouter.post("/create",Auth, workspaceController.create)

export default workspaceRouter