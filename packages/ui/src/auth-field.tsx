"use client";

import { AtSign, Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

export type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: "email" | "password";
  variant?: "filled" | "outlined" | "underline";
};

/** A floating-label input shared by authentication forms across the workspace. */
export function AuthField({
  label,
  error,
  icon,
  variant = "filled",
  id,
  type,
  className,
  ...inputProps
}: AuthFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && passwordVisible ? "text" : type;
  const inputClass = variant === "underline"
    ? "h-10 border-0 border-b border-[#c3c6d7] bg-transparent px-0 py-2"
    : variant === "outlined"
      ? "min-h-14 border border-[#c3c6d7] bg-transparent px-4 py-4"
      : "min-h-14 border border-[#c3c6d7] bg-[#f3f3fe] px-4 pt-6 pb-3";

  return (
    <div className="min-w-0">
      <div className="relative group">
        <input
          id={id}
          type={inputType}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`peer w-full rounded-lg text-base leading-6 text-[#191b23] outline-none transition-all placeholder:text-transparent focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 ${error ? "border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/10" : ""} ${inputClass} ${className ?? ""}`}
          {...inputProps}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute origin-left text-base leading-6 text-[#737686] transition-[transform,color] duration-200 peer-focus:scale-[.85] peer-focus:text-[#004ac6] peer-[:not(:placeholder-shown)]:scale-[.85] peer-[:not(:placeholder-shown)]:text-[#004ac6] ${variant === "underline" ? "top-2 left-0 peer-focus:-translate-y-5 peer-[:not(:placeholder-shown)]:-translate-y-5" : "top-4 left-4 peer-focus:-translate-y-5 peer-[:not(:placeholder-shown)]:-translate-y-5"}`}
        >
          {label}
        </label>
        {icon === "email" ? <AtSign className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-[#737686] transition-colors group-focus-within:text-[#004ac6]" aria-hidden="true" /> : null}
        {isPassword ? (
          <button
            className="absolute top-1/2 right-4 grid size-8 -translate-y-1/2 place-items-center rounded-md text-[#737686] transition hover:text-[#191b23]"
            type="button"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        ) : null}
      </div>
      {error ? <p id={`${id}-error`} className="mt-1.5 text-xs leading-4 text-[#ba1a1a]">{error}</p> : null}
    </div>
  );
}
