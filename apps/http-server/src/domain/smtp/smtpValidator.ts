import type { SmtpCreateInputData } from "@repo/types";
import { SmtpError } from "./smtpError";

export class SmtpValidator {
    static inputDataValidate(inputdata: SmtpCreateInputData) {
        if (!inputdata.workspaceId) {
            throw new SmtpError("Invalid WorkspaceId")
        }
        if (!inputdata.name) {
            throw new SmtpError("Invalid Name")
        }
        if (!inputdata.host) {
            throw new SmtpError("Invalid Host")
        }
        if (!inputdata.port) {
            throw new SmtpError("Invalid Port")
        }
        if (!inputdata.username) {
            throw new SmtpError("Invalid UserName")
        }
        if (!inputdata.password) {
            throw new SmtpError("Invalid Password")
        }
        if (!inputdata.fromName) {
            throw new SmtpError("Invalid FromName")
        }
        if (!inputdata.fromEmail) {
            throw new SmtpError("Invalid fromEmail")
        }
    }
}