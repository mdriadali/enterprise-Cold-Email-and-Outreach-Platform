import nodemailer from "nodemailer";
import type { SmtpAccount } from "@repo/db";
import type { IEmailSender } from "../../../application/Ports/iEmailSender-ports";


export class MailSender implements IEmailSender {
    async send(options: { smtp: SmtpAccount; to: string; subject: string; html: string; text: string; }): Promise<void> {
             const transporter = nodemailer.createTransport({
            host:options.smtp.host,
            port: options.smtp.port,
            secure: options.smtp.encryption === "SSL",
            auth: {
                user:options. smtp.username,
                pass: options.smtp.password,
            },
        });

        const send = await transporter.sendMail({
            from: `"${options.smtp.fromName}" <${options.smtp.fromEmail}>`,
            // to: options.to,
            to:"mdriadali.official@gmail.com",
            replyTo: options.smtp.replyTo ?? undefined,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        console.log(send)
    }
}