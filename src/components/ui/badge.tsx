import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

const tones = {
  neutral: "bg-blue-50 text-navy border-border",
  blue: "bg-blue-100 text-blue-600 border-blue-100",
  yellow: "bg-accent-yellow-bg text-accent-yellow border-accent-yellow-bg",
  red: "bg-accent-red-bg text-accent-red border-accent-red-bg",
  success: "bg-[#eaf6ef] text-signal-normal border-[#eaf6ef]",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: { tone?: keyof typeof tones } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
