import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getEnrollmentForLearner, buildLessonOutline } from "@/lib/data/learning";
import { EmptyState } from "@/components/ui/empty-state";

export default async function CourseLearnIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/sign-in?callbackUrl=/learn/${slug}`);

  const data = await getEnrollmentForLearner(session.user.id, slug);
  if (!data) notFound();

  const outline = buildLessonOutline(data.course, data.enrollment.progress);
  if (outline.length === 0) {
    return (
      <EmptyState
        title="This course has no lessons yet"
        description="The instructor is still preparing this course's content. Check back soon."
      />
    );
  }

  const nextLesson = outline.find((l) => !l.completed) ?? outline[0];
  redirect(`/learn/${slug}/${nextLesson.id}`);
}
