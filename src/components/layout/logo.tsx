import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Placeholder wordmark — the real DM Sheffield logo could not be extracted
 * from the supplied Instagram reference in this environment (no network
 * access to inspect/download it). Replace with the official asset in
 * public/images/brand/logo.svg when supplied. See docs/DECISIONS.md.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-white font-tag text-xs font-bold">
        DM
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-navy">
        DM Sheffield
      </span>
    </Link>
  );
}
