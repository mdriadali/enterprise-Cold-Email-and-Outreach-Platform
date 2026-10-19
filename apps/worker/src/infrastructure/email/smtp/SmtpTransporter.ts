import nodemailer, { type Transporter } from "nodemailer";
import type { SmtpAccount } from "@repo/db";
import { logger } from "../../../logger";

const transporterLogger = logger.child({
  component: "smtp-transporter",
});

/**
 * A single pooled connection per SMTP account is enough for our throughput and
 * keeps us inside provider limits — many providers reject a burst of concurrent
 * logins from the same mailbox. Extra messages wait in nodemailer's internal
 * queue instead of opening more sockets.
 *
 * Previously every email created a brand new transport, i.e. a full
 * TCP + TLS + AUTH handshake per message with up to `concurrency` parallel
 * logins per account.
 */
const MAX_CONNECTIONS_PER_ACCOUNT = 1;
const MAX_MESSAGES_PER_CONNECTION = 50;
const SOCKET_TIMEOUT_MS = 60_000;

interface CachedTransporter {
  transporter: Transporter;
  signature: string;
}

const cache = new Map<string, CachedTransporter>();

function signatureOf(account: SmtpAccount): string {
  // The password is part of the signature, so rotating credentials replaces the
  // pooled connection instead of silently reusing a stale one.
  return [
    account.host,
    account.port,
    account.username,
    account.encryption,
    account.password,
  ].join("|");
}

/** Returns a pooled transporter for the account, creating it on first use. */
export function getSmtpTransporter(account: SmtpAccount): Transporter {
  const signature = signatureOf(account);
  const cached = cache.get(account.id);

  if (cached && cached.signature === signature) {
    return cached.transporter;
  }

  if (cached) {
    // Configuration changed — drop the stale pool.
    closeQuietly(cached.transporter);
    cache.delete(account.id);
  }

  const transporter = nodemailer.createTransport({
    pool: true,
    host: account.host,
    port: account.port,
    secure: account.encryption === "SSL",
    maxConnections: MAX_CONNECTIONS_PER_ACCOUNT,
    maxMessages: MAX_MESSAGES_PER_CONNECTION,
    socketTimeout: SOCKET_TIMEOUT_MS,
    auth: {
      user: account.username,
      pass: account.password,
    },
  });

  cache.set(account.id, { transporter, signature });

  transporterLogger.debug(
    { smtpHost: account.host, username: account.username },
    "Created pooled SMTP transporter",
  );

  return transporter;
}

/**
 * Drops a possibly broken pool so the next send opens a fresh connection.
 * Called after auth or connection failures.
 */
export function invalidateSmtpTransporter(accountId: string): void {
  const cached = cache.get(accountId);
  if (!cached) return;

  closeQuietly(cached.transporter);
  cache.delete(accountId);
}

/** Closes every pooled SMTP connection during graceful shutdown. */
export function closeAllSmtpTransporters(): void {
  for (const [id, cached] of cache) {
    closeQuietly(cached.transporter);
    cache.delete(id);
  }
}

function closeQuietly(transporter: Transporter): void {
  try {
    transporter.close();
  } catch {
    // Closing an already dead pool must never throw during cleanup.
  }
}
