import { Router } from "express";
import { smtpAccountController } from "../container/smtpAccountController-dependencie";

const smtpRouter = Router()

smtpRouter.post("/create", smtpAccountController.create)
smtpRouter.get("/all", smtpAccountController.findAllAcounts)
smtpRouter.get("/:id",smtpAccountController.find)
smtpRouter.put("/:id",smtpAccountController.update)
smtpRouter.delete("/:id",smtpAccountController.delete)
export default smtpRouter