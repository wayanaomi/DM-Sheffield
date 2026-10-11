"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateLessonProgress } from "../../actions";

interface QuestionAnswer {
  questionId: string;
  value: unknown;
}

function gradeQuestion(type: string, correctJson: string, submitted: unknown): boolean {
  const correct = JSON.parse(correctJson);
  switch (type) {
    case "single_choice":
    case "true_false":
      return submitted === correct;
    case "multiple_choice": {
      if (!Array.isArray(submitted) || !Array.isArray(correct)) return false;
      const a = [...submitted].sort();
      const b = [...correct].sort();
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    case "numeric": {
      const { value, tolerance } = correct as { value: number; tolerance?: number };
      const n = Number(submitted);
      if (Number.isNaN(n)) return false;
      return Math.abs(n - value) <= (tolerance ?? 0);
    }
    case "matching": {
      if (typeof submitted !== "object" || submitted === null) return false;
      const entries = Object.entries(correct as Record<string, string>);
      return entries.every(([k, v]) => (submitted as Record<string, string>)[k] === v);
    }
    default:
      return false;
  }
}

export async function submitAssessmentAttempt(
  assessmentId: string,
  lessonId: string,
  enrollmentId: string,
  slug: string,
  answers: QuestionAnswer[]
) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: true },
  });
  if (!assessment) throw new Error("Assessment not found");

  const priorAttempts = await prisma.attempt.count({
    where: { assessmentId, userId: session.user.id },
  });
  if (priorAttempts >= assessment.maxAttempts) {
    throw new Error("Maximum attempts reached for this assessment.");
  }

  let correctCount = 0;
  const answerMap: Record<string, unknown> = {};
  for (const q of assessment.questions) {
    const given = answers.find((a) => a.questionId === q.id)?.value;
    answerMap[q.id] = given;
    if (gradeQuestion(q.type, q.correctJson, given)) correctCount++;
  }
  const score = assessment.questions.length
    ? Math.round((correctCount / assessment.questions.length) * 100)
    : 0;
  const passed = score >= assessment.passMark;

  await prisma.attempt.create({
    data: {
      assessmentId,
      userId: session.user.id,
      submittedAt: new Date(),
      score,
      passed,
      answersJson: JSON.stringify(answerMap),
    },
  });

  // Completion-first policy: attempting the assessment completes the lesson for
  // progress purposes; the score is feedback, not a formal grading gate (see
  // docs/DECISIONS.md). Courses that opt into requireAssessmentPass still check
  // for a passed attempt separately before issuing a certificate.
  await updateLessonProgress(enrollmentId, lessonId, { percent: 100, markComplete: true });

  redirect(`/learn/${slug}/${lessonId}/quiz/result?score=${score}&passed=${passed}`);
}
