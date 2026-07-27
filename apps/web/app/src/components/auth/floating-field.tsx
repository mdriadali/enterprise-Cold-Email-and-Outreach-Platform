import type { InputHTMLAttributes } from "react";

type FloatingFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function FloatingField({ label, hint, id, ...props }: FloatingFieldProps) {
  return (
    <div className="min-w-0">
      <div className="relative flex flex-col pt-4">
        <input id={id} className="peer h-[37px] w-full border-0 border-b border-[#c3c6d7] bg-transparent px-0 py-2 text-base leading-6 text-[#191b23] outline-none" placeholder=" " {...props} />
        <label className="pointer-events-none absolute top-6 left-0 origin-left text-base leading-6 text-[#737686] transition-[transform,color] duration-200 ease-out peer-focus:-translate-y-6 peer-focus:scale-[0.85] peer-focus:text-[#004ac6] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-[0.85] peer-[:not(:placeholder-shown)]:text-[#004ac6]" htmlFor={id}>
          {label}
        </label>
        <span className="-mt-px h-px origin-left scale-x-0 bg-[#004ac6] transition-transform duration-300 ease-out peer-focus:scale-x-100" />
      </div>
      {hint ? <p className="mt-1 text-xs leading-4 text-[#737686]">{hint}</p> : null}
    </div>
  );
}
