import { Router } from "express";
import { smtpAccountController } from "../container/smtpAccountController-dependencie";

const smtpRouter = Router()

smtpRouter.post("/create", smtpAccountController.create)
smtpRouter.get("/all", smtpAccountController.findAllAcounts)
smtpRouter.put("/:id",smtpAccountController.update)

export default smtpRouter