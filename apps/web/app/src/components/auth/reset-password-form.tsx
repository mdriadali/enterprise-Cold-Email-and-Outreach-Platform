"use client";

import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthField } from "@repo/ui/auth-field";
import { useNotification } from "@repo/ui/notification-provider";
import { resetPasswordAction } from "../../actions/auth/reset-password";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters.").regex(/\d/, "Include at least one number."),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ email, token }: { email: string; token: string }) {
  const { notify } = useNotification();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsPending(true);
    const result = await resetPasswordAction({ email, token, password: values.password });
    setIsPending(false);

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (field === "password" || field === "confirmPassword") setError(field, { message: messages?.[0] });
      }
    }

    notify({ title: result.status === "success" ? "Password updated" : "Reset failed", message: result.message, tone: result.status === "success" ? "success" : "error" });
    if (result.status === "success") router.replace("/login");
  });

  return (
    <section className="relative flex min-h-svh w-full flex-col items-center justify-center bg-white p-8 sm:p-12 lg:w-1/2">
      <div className="w-full max-w-md">
        <header className="mb-12 text-center lg:text-left">
          <h1 className="mb-1 text-4xl leading-11 font-bold tracking-[-.01em] text-[#191b23] sm:text-5xl sm:leading-14">Set New Password</h1>
          <p className="text-base leading-6 text-[#434655]">Choose a new password for <span className="font-semibold text-[#191b23]">{email}</span>.</p>
        </header>
        <form className="space-y-6" noValidate onSubmit={onSubmit}>
          <AuthField id="password" label="New Password" type="password" icon="password" error={errors.password?.message} {...register("password")} />
          <AuthField id="confirmPassword" label="Confirm New Password" type="password" icon="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          <div className="pt-4">
            <button className="flex h-14 w-full items-center justify-center gap-4 rounded-lg bg-[#2563eb] text-sm leading-5 font-semibold tracking-[.05em] text-white shadow-sm transition-all hover:shadow-md active:scale-[.98] disabled:cursor-wait disabled:opacity-80" type="submit" disabled={isPending}>
              {isPending ? <><LoaderCircle className="size-5 animate-spin" /> Saving...</> : <>Update Password</>}
            </button>
          </div>
        </form>
        <div className="mt-8 text-center text-sm leading-5 text-[#434655]"><Link className="inline-flex items-center gap-1.5 font-semibold text-[#004ac6] hover:underline" href="/login"><ArrowLeft className="size-4" /> Back to sign in</Link></div>
      </div>
    </section>
  );
}
