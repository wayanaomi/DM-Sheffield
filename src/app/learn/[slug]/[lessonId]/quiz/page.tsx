import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEnrollmentForLearner } from "@/lib/data/learning";
import { QuizForm } from "./quiz-form";
import { submitAssessmentAttempt } from "./actions";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/sign-in?callbackUrl=/learn/${slug}/${lessonId}/quiz`);

  const data = await getEnrollmentForLearner(session.user.id, slug);
  if (!data) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { assessment: { include: { questions: true } } },
  });
  if (!lesson?.assessment) notFound();

  const questions = lesson.assessment.questions.map((q) => ({
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    options: JSON.parse(q.optionsJson) as { id: string; text: string }[],
  }));

  async function handleSubmit(answers: { questionId: string; value: unknown }[]) {
    "use server";
    await submitAssessmentAttempt(
      lesson!.assessment!.id,
      lessonId,
      data!.enrollment.id,
      slug,
      answers
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">{lesson.title}</h1>
      <p className="mt-2 text-sm text-muted">
        Answer the questions below and submit. This assessment provides feedback on your
        understanding — see the course settings for whether a pass is required for
        certification.
      </p>
      <div className="mt-6">
        <QuizForm questions={questions} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
