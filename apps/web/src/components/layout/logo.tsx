import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  size?: "compact" | "standard" | "large";
};

const logoSizes = {
  compact: "h-10 sm:h-11",
  standard: "h-12 sm:h-14",
  large: "h-16 sm:h-20",
};

export function Logo({ className, size = "standard" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="DM Sheffield home"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <Image
        src="/images/brand/dm-sheffield-logo.png"
        alt="DM Sheffield"
        width={1086}
        height={791}
        priority
        className={cn("w-auto object-contain", logoSizes[size])}
        sizes="(max-width: 640px) 140px, 220px"
      />
    </Link>
  );
}
