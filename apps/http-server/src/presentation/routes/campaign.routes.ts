import { Router } from "express";
import { campaignController } from "../container/campaignController-dependencie";

const campaignRouter=Router()

campaignRouter.post("/create",campaignController.create)

export default campaignRouter