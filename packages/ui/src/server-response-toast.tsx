"use client";

import { useEffect } from "react";

import { useNotification } from "./notification-provider";

export type ServerResponseToastProps = {
  title: string;
  message?: string;
  tone: "success" | "error" | "info";
};

/** Displays a notification for a result resolved by a Server Component or Server Action. */
export function ServerResponseToast({ title, message, tone }: Readonly<ServerResponseToastProps>) {
  const { notify } = useNotification();

  useEffect(() => {
    notify({ title, message, tone });
  }, [message, notify, title, tone]);

  return null;
}
