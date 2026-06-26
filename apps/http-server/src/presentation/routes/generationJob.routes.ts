import { Router } from "express";
import { Auth } from "../container/authMiddeleware-dependencies";
import { generationJobController } from "../container/generationJobController-dependencies";

const generationJobRouter=Router()

generationJobRouter.post("/create", Auth,generationJobController.create)
generationJobRouter.post("/:jobid/start",Auth,generationJobController.start)

export default generationJobRouter