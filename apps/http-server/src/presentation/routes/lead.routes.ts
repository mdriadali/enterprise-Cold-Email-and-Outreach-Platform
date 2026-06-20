import { Router } from "express";
import { Auth } from "../container/authMiddeleware-dependencies";
import { leadController } from "../container/leadController-dependencie";

const leadRouter=Router()

leadRouter.post("/create",Auth, leadController.create)
export default leadRouter