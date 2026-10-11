import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "text-center mx-auto max-w-2xl", className)}>
      {eyebrow ? (
        <p className="font-tag text-xs font-semibold uppercase tracking-wider text-blue">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-navy">{title}</h2>
      {description ? <p className="mt-3 text-muted leading-relaxed">{description}</p> : null}
    </div>
  );
}
