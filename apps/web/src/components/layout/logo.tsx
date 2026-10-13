
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="DM Sheffield home"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <Image
        src="/images/brand/dm-sheffield-logo.png"
        alt="DM Sheffield"
        width={220}
        height={160}
        priority
        className="h-12 w-auto object-contain"
        sizes="220px"
      />
    </Link>
  );
}
