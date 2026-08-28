"use client";

import { type JSX } from "react";

/**
 * Full-panel loading indicator shown while a page fetches its data.
 * The spinner disappears as soon as the data resolves (see usage in client pages).
 */
export function PageSpinner({
  label = "Loading data...",
}: {
  label?: string;
}): JSX.Element {
  return (
    <div className="min-h-0 flex-1 flex items-center justify-center p-[32px]">
      <div className="flex flex-col items-center gap-[16px]">
        <div
          className="size-10 rounded-full border-[3px] border-[#c3c6d7] border-t-[#004ac6] animate-spin"
          role="status"
          aria-label="Loading"
        />
        <span className="text-[14px] leading-[20px] text-[#434655]">{label}</span>
      </div>
    </div>
  );
}
