import { Router } from "express";
import { generationJobController } from "../container/generationJobController-dependencies";
import leadRouter from "./lead.routes";

const generationJobRouter = Router()


generationJobRouter.post("/create", generationJobController.create)

generationJobRouter.get("/all", generationJobController.find)
generationJobRouter.get("/:generationJobId", generationJobController.get)
generationJobRouter.post("/:jobid/start", generationJobController.start)

generationJobRouter.put("/:generationJobId", generationJobController.update)

generationJobRouter.delete("/:generationJobId", generationJobController.delete)
generationJobRouter.use("/:generationJobId/lead", leadRouter)

export default generationJobRouter