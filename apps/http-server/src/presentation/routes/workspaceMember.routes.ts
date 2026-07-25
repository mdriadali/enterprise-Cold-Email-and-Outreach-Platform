import { Router } from "express";
import { workspaceMemberController } from "../container/workspaceMemberController-dependencie";

 const workspaceMemberRouter=Router()
workspaceMemberRouter.post("/add",workspaceMemberController.add)

 export default workspaceMemberRouter