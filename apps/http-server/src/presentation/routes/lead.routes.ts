import { Router } from "express";
import { Auth } from "../container/authMiddeleware-dependencies";
import { leadController } from "../container/leadController-dependencie";

const leadRouter=Router()

leadRouter.post("/create",Auth, leadController.create)
leadRouter.post("/bulk-create",Auth,leadController.bulkCreate)
export default leadRouter