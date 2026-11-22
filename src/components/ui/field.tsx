import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";

const control = (tone: Tone) =>
  tone === "dark"
    ? "w-full rounded-md border border-[#44444B] bg-ink px-3 py-2.5 text-base text-bone placeholder:text-bone-dim focus:border-brand-text focus:outline-none"
    : "w-full rounded-md border border-[#D4D4CF] bg-white px-3 py-2.5 text-[15px] text-[#1D1D20] focus:border-brand focus:outline-none";

interface Wrap {
  label: string;
  hint?: ReactNode;
  tone?: Tone;
  className?: string;
}

export function Field({ label, hint, tone = "dark", className, ...props }: Wrap & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm font-medium", className)}>
      {label}
      <input className={cn(control(tone), "min-h-[44px]")} {...props} />
      {hint && <span className="text-xs font-normal opacity-70">{hint}</span>}
    </label>
  );
}

export function TextareaField({ label, hint, tone = "dark", className, ...props }: Wrap & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm font-medium", className)}>
      {label}
      <textarea className={cn(control(tone), "font-sans")} {...props} />
      {hint && <span className="text-xs font-normal opacity-70">{hint}</span>}
    </label>
  );
}

export function SelectField({
  label, tone = "dark", className, options, ...props
}: Wrap & SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm font-medium", className)}>
      {label}
      <select className={cn(control(tone), "min-h-[44px]")} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
