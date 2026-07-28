"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CloudCheck, LoaderCircle, LockKeyhole, ShieldCheck, Verified } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthField } from "@repo/ui/auth-field";
import { useNotification } from "@repo/ui/notification-provider";

import { registrationSchema, type RegistrationValues } from "./auth-schemas";
import { registerEnterpriseAccount } from "../../actions/auth/register";

export function RegistrationForm() {
  const { notify } = useNotification();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<RegistrationValues>({ resolver: zodResolver(registrationSchema), defaultValues: { name: "", email: "", password: "", terms: false } });
  const onSubmit = handleSubmit(async (values) => {
    setIsPending(true);
    const formData = new FormData();
    formData.set("name", values.name); formData.set("email", values.email); formData.set("password", values.password);
    if (values.terms) formData.set("terms", "on");
    const result = await registerEnterpriseAccount(formData);
    setIsPending(false);
    if (result.fieldErrors) for (const [field, messages] of Object.entries(result.fieldErrors)) if (field === "name" || field === "email" || field === "password" || field === "terms") setError(field, { message: messages?.[0] });
    if (result.status === "success") {
      setIsSuccessful(true);
      router.replace("/profile");
    }
    notify({ title: result.status === "success" ? "Workspace created" : "Registration unavailable", message: result.message ?? (result.status === "success" ? "Your enterprise workspace is ready to configure." : undefined), tone: result.status === "success" ? "success" : "error" });
  });
  return <section className="flex min-h-svh items-center justify-center bg-white px-6 py-8 sm:px-12"><div className="w-full max-w-[440px]"><header className="mb-8"><h1 className="mb-2 text-[32px] leading-10 font-bold tracking-[-.01em] text-[#191b23] sm:text-4xl sm:leading-11">Get Started</h1><p className="text-base leading-6 text-[#434655]">Create your professional workspace today.</p></header><form className="grid gap-6" noValidate onSubmit={onSubmit}><AuthField id="name" label="Full Name" type="text" error={errors.name?.message} {...register("name")} /><AuthField id="email" label="Work Email Address" type="email" icon="email" error={errors.email?.message} {...register("email")} /><div><AuthField id="password" label="Create Password" type="password" icon="password" error={errors.password?.message} {...register("password")} /><p className="mt-1 text-xs leading-4 text-[#737686]">Minimum 8 characters with at least one number.</p></div><div><div className="flex items-start gap-2 pt-2 text-sm leading-5 text-[#434655]"><input id="terms" className="mt-0.5 size-4 accent-[#004ac6]" type="checkbox" {...register("terms")} /><label htmlFor="terms">I agree to the <Link className="font-semibold text-[#004ac6] hover:underline hover:underline-offset-4" href="#terms">Service Terms</Link> and <Link className="font-semibold text-[#004ac6] hover:underline hover:underline-offset-4" href="#terms">Privacy Protocol</Link>.</label></div>{errors.terms?.message ? <p className="mt-1.5 text-xs leading-4 text-[#ba1a1a]">{errors.terms.message}</p> : null}</div><button className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#004ac6] to-[#2563eb] text-sm leading-5 font-semibold tracking-[.05em] text-white transition hover:shadow-[0_10px_22px_rgb(0_74_198_/_0.2)] active:scale-[.98] disabled:cursor-default" type="submit" disabled={isPending || isSuccessful}>{isPending ? <><LoaderCircle className="animate-spin" size={20} /> Configuring Workspace...</> : isSuccessful ? <><CheckCircle2 size={20} /> Success</> : "Create Enterprise Account"}</button></form><footer className="mt-8 text-center text-sm leading-5 text-[#434655]">Already have an account? <Link className="ml-1 font-semibold tracking-[.05em] text-[#004ac6] hover:underline hover:underline-offset-4" href="/login">log in</Link></footer><div className="mt-10 flex items-center justify-between border-t border-[#c3c6d7]/50 pt-6 text-[#191b23] grayscale opacity-50 sm:mt-12 sm:pt-8" aria-label="Enterprise security features"><LockKeyhole className="size-8" aria-label="Secure" strokeWidth={1.7} /><ShieldCheck className="size-8" aria-label="Protected" strokeWidth={1.7} /><CloudCheck className="size-8" aria-label="Cloud verified" strokeWidth={1.7} /><Verified className="size-8" aria-label="Verified" strokeWidth={1.7} /></div></div></section>;
}
