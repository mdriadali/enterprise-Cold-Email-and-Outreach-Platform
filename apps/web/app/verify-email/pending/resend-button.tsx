"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useNotification } from "@repo/ui/notification-provider";
import { resendVerificationEmail } from "../../src/actions/auth/resend-verification";

export function ResendVerificationButton() {
  const { notify } = useNotification();
  const [isPending, setIsPending] = useState(false);

  const handleResend = async () => {
    setIsPending(true);
    const result = await resendVerificationEmail();
    setIsPending(false);
    notify({
      title: result.status === "success" ? "Email sent" : "Failed to send",
      message: result.message,
      tone: result.status === "success" ? "success" : "error",
    });
  };

  return (
    <button
      onClick={handleResend}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3 text-sm leading-5 font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[.98] disabled:cursor-wait disabled:opacity-80"
    >
      {isPending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <RotateCcw className="size-4" />
          Resend verification email
        </>
      )}
    </button>
  );
}
