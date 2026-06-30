import { Router } from "express";
import { Auth } from "../container/Middeleware-dependencies";
import { leadController } from "../container/leadController-dependencie";

const leadRouter = Router({ mergeParams: true })

leadRouter.post("/create", leadController.create)
leadRouter.post("/bulk-create",leadController.bulkCreate)
export default leadRouter