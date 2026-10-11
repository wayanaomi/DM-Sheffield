import Link from "next/link";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCoursesForAdmin } from "@/lib/data/admin";
import { CATEGORY_LABELS, type CourseCategory } from "@/lib/enums";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Manage courses" };

const statusTone = { draft: "neutral", review: "yellow", published: "success" } as const;

export default async function AdminCoursesPage() {
  const session = await auth();
  const courses = await getCoursesForAdmin(session!);

  return (
    <Container className="py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy">Courses</h1>
        <LinkButton href="/admin/courses/new">New course</LinkButton>
      </div>

      <div className="mt-6">
        {courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Create your first course to start building the catalogue."
            action={<LinkButton href="/admin/courses/new">New course</LinkButton>}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-blue-50/60 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Enrolments</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-4 py-3 font-medium text-ink">{course.title}</td>
                    <td className="px-4 py-3 text-muted">
                      {CATEGORY_LABELS[course.category as CourseCategory] ?? course.category}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[course.status as keyof typeof statusTone] ?? "neutral"}>
                        {course.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatPrice(course.priceMinor, course.currency)}</td>
                    <td className="px-4 py-3 text-muted">{course._count.enrollments}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/courses/${course.id}`} className="text-sm font-medium text-blue">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}
