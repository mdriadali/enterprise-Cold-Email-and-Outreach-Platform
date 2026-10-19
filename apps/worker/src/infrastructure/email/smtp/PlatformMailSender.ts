import nodemailer, { type Transporter } from "nodemailer";

import { workerEnv } from "@repo/env/worker-env";

import type { IAuthEmailSender } from "../../../application/Ports/iAuthEmailSender-ports";
import { logger } from "../../../logger";

const mailLogger = logger.child({
  component: "platform-mail-sender",
});

const MAX_CONNECTIONS = 1;
const MAX_MESSAGES_PER_CONNECTION = 50;
const SOCKET_TIMEOUT_MS = 60_000;

interface CachedTransporter {
  transporter: Transporter;
  signature: string;
}

// The platform mailbox is a single account, so one pooled transporter is enough
// for every transactional email (verification / password reset).
let cached: CachedTransporter | undefined;

function signature(): string {
  return [
    workerEnv.SMTP_HOST,
    workerEnv.SMTP_PORT,
    workerEnv.SMTP_USER,
    workerEnv.SMTP_ENCRYPTION,
    workerEnv.SMTP_PASS,
  ].join("|");
}

function getTransporter(): Transporter {
  const currentSignature = signature();

  if (cached && cached.signature === currentSignature) {
    return cached.transporter;
  }

  if (cached) {
    closeQuietly(cached.transporter);
    cached = undefined;
  }

  const transporter = nodemailer.createTransport({
    pool: true,
    host: workerEnv.SMTP_HOST,
    port: Number(workerEnv.SMTP_PORT),
    secure: workerEnv.SMTP_ENCRYPTION === "ssl",
    requireTLS: workerEnv.SMTP_ENCRYPTION === "tls",
    maxConnections: MAX_CONNECTIONS,
    maxMessages: MAX_MESSAGES_PER_CONNECTION,
    socketTimeout: SOCKET_TIMEOUT_MS,
    auth: {
      user: workerEnv.SMTP_USER,
      pass: workerEnv.SMTP_PASS,
    },
  });

  cached = { transporter, signature: currentSignature };
  return transporter;
}

function closeQuietly(transporter: Transporter): void {
  try {
    transporter.close();
  } catch {
    // Closing an already dead pool must never throw during cleanup.
  }
}

/** Closes the pooled platform connection during graceful shutdown. */
export function closePlatformTransporter(): void {
  if (!cached) return;
  closeQuietly(cached.transporter);
  cached = undefined;
}

export class PlatformMailSender implements IAuthEmailSender {
  async send(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    const transporter = getTransporter();

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
