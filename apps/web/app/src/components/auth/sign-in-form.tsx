"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AuthField } from "@repo/ui/auth-field";
import { useNotification } from "@repo/ui/notification-provider";
import { signInSchema, type SignInValues } from "./auth-schemas";
import { signInEnterpriseAccount } from "../../actions/auth/login";

export function SignInForm() {
  const { notify } = useNotification();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsPending(true);
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    const result = await signInEnterpriseAccount(formData);
    setIsPending(false);

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (field === "email" || field === "password") setError(field, { message: messages?.[0] });
      }
    }
    notify({ title: result.status === "success" ? "Welcome back" : "Sign-in unavailable", message: result.message, tone: result.status === "success" ? "success" : "error" });
    if (result.status === "success") router.replace("/workspaces");
  });

  return (
    <section className="relative flex min-h-svh w-full flex-col items-center justify-center bg-white p-8 sm:p-12 lg:w-1/2">
      <div className="w-full max-w-md">
        <header className="mb-12 text-center lg:text-left">
          <h1 className="mb-1 text-4xl leading-11 font-bold tracking-[-.01em] text-[#191b23] sm:text-5xl sm:leading-14">Welcome Back</h1>
          <p className="text-base leading-6 text-[#434655]">Sign in to your enterprise workspace</p>
        </header>
        <form className="space-y-6" noValidate onSubmit={onSubmit}>
          <AuthField id="email" label="Work Email Address" type="email" icon="email" error={errors.email?.message} {...register("email")} />
          <div className="space-y-1">
            <AuthField id="password" label="Password" type="password" icon="password" error={errors.password?.message} {...register("password")} />
            <div className="flex justify-end"><Link className="text-xs leading-4 font-medium text-[#004ac6] hover:underline" href="#forgot-password">Forgot Password?</Link></div>
          </div>
          <div className="pt-4">
            <button className="group flex h-14 w-full items-center justify-center gap-4 rounded-lg bg-[#2563eb] text-sm leading-5 font-semibold tracking-[.05em] text-white shadow-sm transition-all hover:shadow-md active:scale-[.98] disabled:cursor-wait disabled:opacity-80" type="submit" disabled={isPending}>
              {isPending ? <><LoaderCircle className="size-5 animate-spin" /> Authenticating...</> : <>Sign In to Account <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" /></>}
            </button>
          </div>
        </form>
        <div className="mt-8 text-center text-sm leading-5 text-[#434655]">Don&apos;t have an account? <Link className="font-bold text-[#004ac6] hover:underline" href="/register">Create one</Link></div>
        <SecurityBadges />
      </div>
      <footer className="absolute bottom-4 text-center text-xs leading-4 text-[#737686]">© 2024 ColdReach AI. All Rights Reserved.</footer>
    </section>
  );
}

function SecurityBadges() {
  const badges = ["Secure Access", "Data Encrypted", "SSO Compatible", "Identity Verified"];
  return <div className="mt-12 grid grid-cols-2 gap-4 border-t border-[#c3c6d7] pt-8 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100 md:grid-cols-4">{badges.map((badge) => <div className="flex flex-col items-center gap-1" key={badge}><span className="text-xl" aria-hidden="true">⌾</span><span className="text-center text-[10px] leading-4 uppercase">{badge}</span></div>)}</div>;
}
