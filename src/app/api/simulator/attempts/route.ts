import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureScenarioVersion } from "@/lib/data/simulator";
import { checkAndIssueCertificate } from "@/lib/certificates";

const bodySchema = z.object({
  scenarioKey: z.string(),
  seed: z.number(),
  actionLog: z.array(z.unknown()),
  score: z.number(),
  passed: z.boolean(),
  complete: z.boolean(),
  durationMs: z.number(),
  lessonId: z.string().optional(),
  enrollmentId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "unauthenticated", message: "Sign in to save a simulation run" } },
      { status: 401 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "invalid_body", message: parsed.error.message } },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const { scenario, version } = await ensureScenarioVersion(body.scenarioKey);

  const attempt = await prisma.simulationAttempt.create({
    data: {
      userId: session.user.id,
      scenarioId: scenario.id,
      scenarioVersionId: version.id,
      seed: body.seed,
      actionLogJson: JSON.stringify(body.actionLog),
      score: body.score,
      passed: body.passed,
      complete: body.complete,
      durationMs: body.durationMs,
      completedAt: body.complete ? new Date() : null,
    },
  });

  if (body.lessonId && body.enrollmentId && body.complete) {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: body.enrollmentId } });
    if (enrollment && enrollment.userId === session.user.id) {
      const lessonProgress = await prisma.lessonProgress.upsert({
        where: { enrollmentId_lessonId: { enrollmentId: body.enrollmentId, lessonId: body.lessonId } },
        create: {
          enrollmentId: body.enrollmentId,
          lessonId: body.lessonId,
          percent: 100,
          completedAt: new Date(),
        },
        update: { percent: 100, completedAt: new Date() },
      });
      await checkAndIssueCertificate(lessonProgress.enrollmentId);
    }
  }

  return NextResponse.json({ attemptId: attempt.id });
}
