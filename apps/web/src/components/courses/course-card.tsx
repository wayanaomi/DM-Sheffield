import Link from "next/link";
import type { Course } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { CATEGORY_LABELS, LEVEL_LABELS, type CourseCategory, type CourseLevel } from "@/lib/enums";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/training/${course.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <Badge tone="blue">{CATEGORY_LABELS[course.category as CourseCategory] ?? course.category}</Badge>
        <span className="font-tag text-xs text-muted">{LEVEL_LABELS[course.level as CourseLevel] ?? course.level}</span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-navy group-hover:text-blue">
        {course.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{course.summary}</p>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-semibold text-navy">
          {formatPrice(course.priceMinor, course.currency)}
        </span>
        {course.certificateEnabled ? (
          <span className="text-xs text-muted">Certificate on completion</span>
        ) : null}
      </div>
    </Link>
  );
}
