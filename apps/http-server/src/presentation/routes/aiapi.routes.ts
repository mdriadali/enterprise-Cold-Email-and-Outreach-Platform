import { Router } from "express";
import { Auth } from "../container/Middeleware-dependencies";
import { aiApiController } from "../container/aiApiController-dependencies";

const aiApiRouter = Router()


aiApiRouter.post("/create", aiApiController.create)


aiApiRouter.get("/find", aiApiController.find)


aiApiRouter.put("/:id", aiApiController.update)

aiApiRouter.delete("/:id", aiApiController.delete)

export default aiApiRouter