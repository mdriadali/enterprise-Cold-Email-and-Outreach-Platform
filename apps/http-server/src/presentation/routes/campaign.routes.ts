import { Router } from "express";
import { campaignController } from "../container/campaignController-dependencie";
import campainEmailrouter from "./campaignEmail.routes";


const campaignRouter = Router()

campaignRouter.post("/create", campaignController.create)
campaignRouter.get("/:id",campaignController.find)
campaignRouter.patch("/:id/status", campaignController.updateStatus)
campaignRouter.put("/:id",campaignController.update)
campaignRouter.delete("/:id",campaignController.delete)
campaignRouter.use("/:campaignId/emails",campainEmailrouter)
export default campaignRouter