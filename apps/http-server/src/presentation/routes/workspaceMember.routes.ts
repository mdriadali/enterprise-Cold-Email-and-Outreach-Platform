import { Router } from "express";
import { workspaceMemberController } from "../container/workspaceMemberController-dependencie";

const workspaceMemberRouter = Router()
workspaceMemberRouter.post("/add", workspaceMemberController.add)
workspaceMemberRouter.delete("/:memberId")

export default workspaceMemberRouter