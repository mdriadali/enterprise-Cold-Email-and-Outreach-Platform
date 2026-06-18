import { Router } from "express";
import { Auth } from "../container/authMiddeleware-dependencies";
import { aiApiController } from "../container/aiApiController-dependencies";

const aiApiRouter=Router()

aiApiRouter.post("/create",Auth,aiApiController.create)

export default aiApiRouter