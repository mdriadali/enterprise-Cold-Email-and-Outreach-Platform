import type { SmtpAccount } from "@repo/db";

import type { IEmailSender } from "../../../application/Ports/iEmailSender-ports";
import { classifySmtpError } from "./SmtpError";
import {
  getSmtpTransporter,
  invalidateSmtpTransporter,
} from "./SmtpTransporter";
import { logger } from "../../../logger";

const mailLogger = logger.child({
  component: "smtp-mail-sender",
});

export class MailSender implements IEmailSender {
  async send(options: {
    smtp: SmtpAccount;
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    const transporter = getSmtpTransporter(options.smtp);

    try {
      const send = await transporter.sendMail({
        from: `"${options.smtp.fromName}" <${options.smtp.fromEmail}>`,

        // Remove this test email before production
        // to: "mdriadali.official@gmail.com",
        to: options.to,

        replyTo: options.smtp.replyTo ?? undefined,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      mailLogger.info(
        {
          messageId: send.messageId,
          to: options.to,
          smtpHost: options.smtp.host,
        },
        "SMTP mail sent successfully",
      );
    } catch (err) {
      const smtpError = classifySmtpError(err);

      // A failed auth or dead connection leaves the pooled socket unusable;
      // drop it so the next attempt reconnects cleanly.
      if (smtpError.code === "AUTH_FAILED" || smtpError.code === "CONNECTION") {
        invalidateSmtpTransporter(options.smtp.id);
      }

      mailLogger.error(
        {
          err,
          smtpErrorCode: smtpError.code,
          to: options.to,
          smtpHost: options.smtp.host,
        },
        "SMTP mail sending failed",
      );

      throw smtpError;
    }
  }
}
