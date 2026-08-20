"use client";

import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { verifyEmailAction } from "../../actions/auth/verify-email";

export function VerifyEmailForm({ email, token }: { email: string; token: string }) {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await verifyEmailAction({ email, token });
      if (!active) return;
      if (result.status === "success") {
        setStatus("success");
        setMessage(result.message);
      } else {
        setStatus("error");
        setMessage(result.message ?? "This verification link is invalid or has expired.");
      }
    })();
    return () => { active = false; };
  }, [email, token]);

  return (
    <section className="relative flex min-h-svh w-full flex-col items-center justify-center bg-white p-8 sm:p-12 lg:w-1/2">
      <div className="w-full max-w-md text-center">
        {status === "verifying" ? (
          <>
            <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#004ac6]/10 text-[#004ac6]"><LoaderCircle className="size-8 animate-spin" /></div>
            <h1 className="mb-2 text-3xl leading-10 font-bold tracking-[-.01em] text-[#191b23]">Verifying your email</h1>
            <p className="text-base leading-6 text-[#434655]">Please wait while we confirm your email address.</p>
          </>
        ) : status === "success" ? (
          <>
            <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#006f67]/10 text-[#006f67]"><CheckCircle2 className="size-8" /></div>
            <h1 className="mb-2 text-3xl leading-10 font-bold tracking-[-.01em] text-[#191b23]">Email verified</h1>
            <p className="mb-8 text-base leading-6 text-[#434655]">{message ?? "Your email address has been verified."}</p>
            <Link className="inline-flex items-center justify-center rounded-lg bg-[#2563eb] px-6 py-3 text-sm leading-5 font-semibold text-white shadow-sm transition hover:shadow-md" href="/login">Sign in</Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#ba1a1a]/10 text-[#ba1a1a]"><XCircle className="size-8" /></div>
            <h1 className="mb-2 text-3xl leading-10 font-bold tracking-[-.01em] text-[#191b23]">Verification failed</h1>
            <p className="mb-8 text-base leading-6 text-[#434655]">{message ?? "This verification link is invalid or has expired."}</p>
            <Link className="inline-flex items-center justify-center rounded-lg bg-[#2563eb] px-6 py-3 text-sm leading-5 font-semibold text-white shadow-sm transition hover:shadow-md" href="/login">Go to sign in</Link>
          </>
        )}
      </div>
    </section>
  );
}
