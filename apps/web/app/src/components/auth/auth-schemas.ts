import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid work email address."),
  password: z.string().min(1, "Password is required."),
});

export const registrationSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid work email address."),
  password: z.string().min(8, "Use at least 8 characters.").regex(/\d/, "Include at least one number."),
  terms: z.boolean().refine((accepted) => accepted, "Please accept the terms to continue."),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type RegistrationValues = z.infer<typeof registrationSchema>;
