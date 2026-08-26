import nodemailer from "nodemailer";

import { workerEnv } from "@repo/env/worker-env";


import type { IAuthEmailSender } from "../../../application/Ports/iAuthEmailSender-ports";
import { logger } from "../../../logger";

const mailLogger = logger.child({
  component: "platform-mail-sender",
});

export class PlatformMailSender implements IAuthEmailSender {
  async send(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: workerEnv.SMTP_HOST,
      port: Number(workerEnv.SMTP_PORT),
      secure: workerEnv.SMTP_ENCRYPTION === "ssl",
      requireTLS: workerEnv.SMTP_ENCRYPTION === "tls",
      auth: {
        user: workerEnv.SMTP_USER,
        pass: workerEnv.SMTP_PASS,
      },
    });

    try {
      const send = await transporter.sendMail({
        from: workerEnv.MAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      mailLogger.info(
        {
          messageId: send.messageId,
          to: options.to,
          smtpHost: workerEnv.SMTP_HOST,
        },
        "Platform email sent successfully",
      );
    } catch (err) {
      mailLogger.error(
        {
          err,
          to: options.to,
          smtpHost: workerEnv.SMTP_HOST,
        },
        "Platform email sending failed",
      );

      throw err;
    }
  }
}