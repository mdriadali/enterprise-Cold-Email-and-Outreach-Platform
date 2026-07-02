import { Router } from "express";
import { leadController } from "../container/leadController-dependencie";

const leadRouter = Router({ mergeParams: true })

leadRouter.post("/create", leadController.create)
leadRouter.post("/bulk-create",leadController.bulkCreate)
leadRouter.get("/all", leadController.allLeadFind)
export default leadRouter