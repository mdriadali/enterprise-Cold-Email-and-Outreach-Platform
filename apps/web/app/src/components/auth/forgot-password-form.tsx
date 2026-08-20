"use client";

import { ArrowLeft, LoaderCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthField } from "@repo/ui/auth-field";
import { useNotification } from "@repo/ui/notification-provider";
import { forgotPasswordAction } from "../../actions/auth/forgot-password";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid work email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { notify } = useNotification();
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsPending(true);
    const result = await forgotPasswordAction(values.email);
    setIsPending(false);

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (field === "email") setError(field, { message: messages?.[0] });
      }
    }

    notify({ title: result.status === "success" ? "Reset link sent" : "Request failed", message: result.message, tone: result.status === "success" ? "success" : "error" });
    if (result.status === "success") setSent(true);
  });

  if (sent) {
    return (
      <section className="relative flex min-h-svh w-full flex-col items-center justify-center bg-white p-8 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#006f67]/10 text-[#006f67]"><MailCheck className="size-8" /></div>
          <h1 className="mb-2 text-3xl leading-10 font-bold tracking-[-.01em] text-[#191b23]">Check your inbox</h1>
          <p className="mb-8 text-base leading-6 text-[#434655]">If an account exists for this email, a password reset link has been sent. The link is valid for 15 minutes.</p>
          <Link className="inline-flex items-center gap-2 text-sm leading-5 font-semibold text-[#004ac6] hover:underline" href="/login"><ArrowLeft className="size-4" /> Back to sign in</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-svh w-full flex-col items-center justify-center bg-white p-8 sm:p-12 lg:w-1/2">
      <div className="w-full max-w-md">
        <header className="mb-12 text-center lg:text-left">
          <h1 className="mb-1 text-4xl leading-11 font-bold tracking-[-.01em] text-[#191b23] sm:text-5xl sm:leading-14">Forgot Password?</h1>
          <p className="text-base leading-6 text-[#434655]">Enter your email and we&apos;ll send you a reset link.</p>
        </header>
        <form className="space-y-6" noValidate onSubmit={onSubmit}>
          <AuthField id="email" label="Work Email Address" type="email" icon="email" error={errors.email?.message} {...register("email")} />
          <div className="pt-4">
            <button className="flex h-14 w-full items-center justify-center gap-4 rounded-lg bg-[#2563eb] text-sm leading-5 font-semibold tracking-[.05em] text-white shadow-sm transition-all hover:shadow-md active:scale-[.98] disabled:cursor-wait disabled:opacity-80" type="submit" disabled={isPending}>
              {isPending ? <><LoaderCircle className="size-5 animate-spin" /> Sending...</> : <>Send Reset Link</>}
            </button>
          </div>
        </form>
        <div className="mt-8 text-center text-sm leading-5 text-[#434655]"><Link className="inline-flex items-center gap-1.5 font-semibold text-[#004ac6] hover:underline" href="/login"><ArrowLeft className="size-4" /> Back to sign in</Link></div>
      </div>
    </section>
  );
}
