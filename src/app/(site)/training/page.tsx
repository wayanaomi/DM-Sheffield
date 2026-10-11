import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { getPublishedCourses } from "@/lib/data/courses";
import { CATEGORY_LABELS, CourseCategory, CourseLevel, LEVEL_LABELS } from "@/lib/enums";
import { cn } from "@/lib/cn";
import Link from "next/link";

export const metadata = { title: "Training catalogue" };

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/training?${qs}` : "/training";
}

export default async function TrainingCataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; level?: string; free?: string; q?: string }>;
}) {
  const params = await searchParams;
  const category = CourseCategory.safeParse(params.category).success
    ? (params.category as CourseCategory)
    : undefined;
  const level = CourseLevel.safeParse(params.level).success ? (params.level as CourseLevel) : undefined;
  const free = params.free === "free" || params.free === "paid" ? params.free : undefined;

  const courses = await getPublishedCourses({ category, level, free, query: params.q });

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Training catalogue"
        title="Browse DM Sheffield training"
        description="Structured courses in process safety, offshore safety, piping and instrumentation design and HAZOP — filter by category, level and format."
      />

      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-border pb-6">
        <Link
          href={buildHref({ level: params.level, free: params.free, q: params.q })}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm",
            !category ? "border-blue bg-blue-50 text-blue" : "border-border text-muted hover:text-blue"
          )}
        >
          All categories
        </Link>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={buildHref({ category: key, level: params.level, free: params.free, q: params.q })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              category === key ? "border-blue bg-blue-50 text-blue" : "border-border text-muted hover:text-blue"
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">Level:</span>
        {(["beginner", "intermediate", "advanced"] as const).map((l) => (
          <Link
            key={l}
            href={buildHref({ category, level: level === l ? undefined : l, free })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              level === l ? "border-blue bg-blue-50 text-blue" : "border-border text-muted hover:text-blue"
            )}
          >
            {LEVEL_LABELS[l]}
          </Link>
        ))}
        <span className="ml-4 text-xs font-medium uppercase tracking-wide text-muted">Format:</span>
        {(["free", "paid"] as const).map((f) => (
          <Link
            key={f}
            href={buildHref({ category, level, free: free === f ? undefined : f })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize",
              free === f ? "border-blue bg-blue-50 text-blue" : "border-border text-muted hover:text-blue"
            )}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="mt-10">
        {courses.length === 0 ? (
          <EmptyState
            title="No published courses match these filters yet"
            description="DM Sheffield's catalogue is actively being prepared. Try a different filter, or check back soon for new training."
            action={
              <LinkButton href="/training" variant="secondary">
                Clear filters
              </LinkButton>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
