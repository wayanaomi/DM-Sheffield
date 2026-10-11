import Link from "next/link";
import { cn } from "@/lib/cn";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2";

const variants = {
  primary: "bg-blue text-white hover:bg-blue-600 px-5 py-2.5",
  secondary: "bg-white text-navy border border-border hover:bg-blue-50 px-5 py-2.5",
  ghost: "text-blue hover:bg-blue-50 px-4 py-2",
  danger: "bg-accent-red text-white hover:opacity-90 px-5 py-2.5",
};

type Variant = keyof typeof variants;

interface CommonProps {
  variant?: Variant;
  className?: string;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className,
  href,
  ...props
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <Link href={href} className={cn(base, variants[variant], className)} {...props} />;
}
