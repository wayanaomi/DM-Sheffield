import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEnrollmentForLearner, buildLessonOutline } from "@/lib/data/learning";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { VideoLessonPlayer, MarkCompleteButton } from "./lesson-interactions";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/sign-in?callbackUrl=/learn/${slug}/${lessonId}`);

  const data = await getEnrollmentForLearner(session.user.id, slug);
  if (!data) notFound();

  const outline = buildLessonOutline(data.course, data.enrollment.progress);
  const index = outline.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();

  const item = outline[index];
  if (item.locked) {
    return (
      <EmptyState
        title="This lesson is locked"
        description="Complete the preceding required lessons in this course to unlock it."
        action={<LinkButton href={`/learn/${slug}`}>Back to course</LinkButton>}
      />
    );
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { asset: true, assessment: { include: { questions: true } } },
  });
  if (!lesson) notFound();

  const prev = index > 0 ? outline[index - 1] : null;
  const next = index < outline.length - 1 ? outline[index + 1] : null;

  return (
    <div>
      <p className="font-tag text-xs font-semibold uppercase tracking-wide text-blue">
        {item.moduleTitle}
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-navy">{lesson.title}</h1>

      <div className="mt-6">
        {lesson.type === "rich_text" ? (
          <div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
              {lesson.content || "This lesson's content is still being prepared."}
            </p>
            <div className="mt-6">
              <MarkCompleteButton
                enrollmentId={data.enrollment.id}
                lessonId={lesson.id}
                initialCompleted={item.completed}
              />
            </div>
          </div>
        ) : null}

        {lesson.type === "video" ? (
          lesson.asset ? (
            <VideoLessonPlayer
              enrollmentId={data.enrollment.id}
              lessonId={lesson.id}
              src={lesson.asset.storageKey}
              thresholdPercent={lesson.completionThreshold}
              initialCompleted={item.completed}
            />
          ) : (
            <EmptyState
              title="Video not yet uploaded"
              description="The instructor hasn't uploaded video content for this lesson yet."
            />
          )
        ) : null}

        {lesson.type === "pdf" ? (
          lesson.asset ? (
            <div>
              <iframe
                src={lesson.asset.storageKey}
                className="h-[70vh] w-full rounded-lg border border-border"
                title={lesson.title}
              />
              <div className="mt-4">
                <MarkCompleteButton
                  enrollmentId={data.enrollment.id}
                  lessonId={lesson.id}
                  initialCompleted={item.completed}
                  label="Mark as read"
                />
              </div>
            </div>
          ) : (
            <EmptyState
              title="PDF not yet uploaded"
              description="The instructor hasn't uploaded a document for this lesson yet."
            />
          )
        ) : null}

        {lesson.type === "quiz" ? (
          lesson.assessment ? (
            <div className="rounded-lg border border-border p-6">
              <p className="text-sm text-muted">
                {lesson.assessment.questions.length} question(s) · pass mark{" "}
                {lesson.assessment.passMark}% (feedback only — not required for certification unless
                this course is configured to require it).
              </p>
              <LinkButton href={`/learn/${slug}/${lessonId}/quiz`} className="mt-4">
                Start assessment
              </LinkButton>
            </div>
          ) : (
            <EmptyState
              title="Assessment not yet configured"
              description="The instructor hasn't attached an assessment to this lesson yet."
            />
          )
        ) : null}

        {lesson.type === "simulation" ? (
          lesson.scenarioKey ? (
            <div className="rounded-lg border border-border p-6">
              <p className="text-sm text-muted">
                This lesson uses the P&amp;ID simulator. Complete the scenario to mark this lesson done.
              </p>
              <LinkButton href={`/simulator/${lesson.scenarioKey}?lessonId=${lesson.id}&enrollmentId=${data.enrollment.id}`} className="mt-4">
                Open simulator scenario
              </LinkButton>
            </div>
          ) : (
            <EmptyState
              title="Simulator scenario not yet configured"
              description="The instructor hasn't attached a simulation scenario to this lesson yet."
            />
          )
        ) : null}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        {prev ? (
          <Link href={`/learn/${slug}/${prev.id}`} className="inline-flex items-center gap-1 text-sm text-blue">
            <ChevronLeft className="h-4 w-4" /> Previous
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/learn/${slug}/${next.id}`} className="inline-flex items-center gap-1 text-sm text-blue">
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <LinkButton href={`/learn/${slug}`} variant="secondary">
            Back to course
          </LinkButton>
        )}
      </div>
    </div>
  );
}
