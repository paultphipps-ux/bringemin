import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "light" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  outline: "border border-[#55555C] text-bone hover:border-bone",
  ghost: "text-current hover:bg-black/5",
  light: "border border-paper-line bg-white text-[#1D1D20] hover:bg-paper",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const buttonClass = (variant: Variant = "primary", extra?: string) =>
  cn(
    "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-5 py-2.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    extra,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "primary", className, ...props }, ref) => (
  <button ref={ref} className={buttonClass(variant, className)} {...props} />
));
Button.displayName = "Button";
