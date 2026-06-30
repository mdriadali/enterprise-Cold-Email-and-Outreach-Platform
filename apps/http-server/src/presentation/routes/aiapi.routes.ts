import { Router } from "express";
import { Auth } from "../container/Middeleware-dependencies";
import { aiApiController } from "../container/aiApiController-dependencies";

const aiApiRouter = Router()

aiApiRouter.post("/create", aiApiController.create)

export default aiApiRouter