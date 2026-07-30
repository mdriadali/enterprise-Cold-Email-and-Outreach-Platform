import { Router } from "express";
import { campaignEmailController } from "../container/campaignemailcontroller-dependencie";

const campainEmailrouter=Router({ mergeParams: true })

campainEmailrouter.get("/all", campaignEmailController.all)

export default campainEmailrouter


