"use server";

import { callApi } from "../auth/api-client";

export type CreateSmtpResult = { status: "success"; id: string } | { status: "error"; message: string };

export async function createSmtpAccount(workspaceId: string, formData: FormData): Promise<CreateSmtpResult> {
  const name = formData.get("name");
  const host = formData.get("host");
  const portNumber = formData.get("portNumber");
  const username = formData.get("username");
  const password = formData.get("password");
  const fromName = formData.get("fromName");
  const fromEmail = formData.get("fromEmail");
  const replyTo = formData.get("replyTo");
  const encryption = formData.get("encryption");

  if (typeof name !== "string" || !name.trim()) return { status: "error", message: "Name is required." };
  if (typeof host !== "string" || !host.trim()) return { status: "error", message: "Host is required." };
  if (typeof portNumber !== "string" || !portNumber.trim()) return { status: "error", message: "Port is required." };
  if (typeof username !== "string" || !username.trim()) return { status: "error", message: "Username is required." };
  if (typeof password !== "string" || !password.trim()) return { status: "error", message: "Password is required." };
  if (typeof fromName !== "string" || !fromName.trim()) return { status: "error", message: "From name is required." };
  if (typeof fromEmail !== "string" || !fromEmail.trim()) return { status: "error", message: "From email is required." };
  if (typeof encryption !== "string" || !["NONE", "SSL", "TLS"].includes(encryption)) return { status: "error", message: "Encryption must be NONE, SSL, or TLS." };

  const result = await callApi({
    method: "POST",
    url: `workspace/${workspaceId}/smtpaccount/create`,
    data: { name, host, portNumber, username, password, fromName, fromEmail, replyTo: replyTo || undefined, encryption },
  });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  const id = typeof payload?.id === "string" ? payload.id : undefined;
  if (!id) return { status: "error", message: "Account created but couldn't retrieve its ID." };
  return { status: "success", id };
}
