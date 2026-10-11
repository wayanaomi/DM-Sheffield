import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Lock, FileText, PlayCircle, HelpCircle, Beaker } from "lucide-react";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { getEnrollmentForLearner, buildLessonOutline } from "@/lib/data/learning";
import { cn } from "@/lib/cn";

const lessonIcon = {
  video: PlayCircle,
  pdf: FileText,
  rich_text: FileText,
  quiz: HelpCircle,
  simulation: Beaker,
} as const;

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/sign-in?callbackUrl=/learn/${slug}`);

  const data = await getEnrollmentForLearner(session.user.id, slug);
  if (!data) notFound();

  const outline = buildLessonOutline(data.course, data.enrollment.progress);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="border-b border-border bg-white lg:w-80 lg:flex-none lg:border-b-0 lg:border-r">
        <div className="border-b border-border px-5 py-4">
          <Link href={`/training/${slug}`} className="text-xs text-blue hover:underline">
            ← Back to course details
          </Link>
          <h1 className="mt-1 text-base font-semibold text-navy">{data.course.title}</h1>
        </div>
        <nav className="max-h-[70vh] overflow-y-auto px-2 py-3">
          {data.course.modules.map((module, mIdx) => (
            <div key={module.id} className="mb-3">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Module {mIdx + 1}: {module.title}
              </p>
              <ul>
                {module.lessons.map((lesson) => {
                  const item = outline.find((o) => o.id === lesson.id)!;
                  const Icon = lessonIcon[item.type as keyof typeof lessonIcon] ?? FileText;
                  return (
                    <li key={lesson.id}>
                      {item.locked ? (
                        <span className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted/60">
                          <Lock className="h-4 w-4 flex-none" />
                          {lesson.title}
                        </span>
                      ) : (
                        <Link
                          href={`/learn/${slug}/${lesson.id}`}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-blue-50",
                            item.completed ? "text-ink" : "text-ink"
                          )}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4 flex-none text-signal-normal" />
                          ) : (
                            <Icon className="h-4 w-4 flex-none text-muted" />
                          )}
                          {lesson.title}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <Container className="max-w-3xl py-8">{children}</Container>
      </div>
    </div>
  );
}
