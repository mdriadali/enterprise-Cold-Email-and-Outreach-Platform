"use client";

import { type JSX } from "react";

/**
 * Full-panel error state used when a page's data cannot be loaded
 * (for example when the current user does not belong to this workspace).
 * The server-side workspace middleware is the source of truth for access;
 * this is only a graceful fallback when the fetch fails.
 */
export function PageError({
  title = "Something went wrong",
  message = "We couldn't load this page. Please try again.",
}: {
  title?: string;
  message?: string;
}): JSX.Element {
  return (
    <div className="min-h-0 flex-1 flex items-center justify-center p-[32px]">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-[16px] flex size-12 items-center justify-center rounded-lg bg-[#ffdad6] text-[#ba1a1a]">
          <svg className="size-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-[20px] leading-[28px] font-bold tracking-[-0.01em] text-[#191b23]">{title}</h2>
        <p className="mt-[8px] text-[14px] leading-[20px] text-[#434655]">{message}</p>
      </div>
    </div>
  );
}
