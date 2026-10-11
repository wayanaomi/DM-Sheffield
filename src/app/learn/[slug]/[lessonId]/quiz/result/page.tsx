import { CheckCircle2, XCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export default async function QuizResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
  searchParams: Promise<{ score?: string; passed?: string }>;
}) {
  const { slug, lessonId } = await params;
  const { score, passed } = await searchParams;
  const didPass = passed === "true";

  return (
    <div className="flex flex-col items-center py-10 text-center">
      {didPass ? (
        <CheckCircle2 className="h-12 w-12 text-signal-normal" />
      ) : (
        <XCircle className="h-12 w-12 text-accent-red" />
      )}
      <h1 className="mt-4 text-2xl font-semibold text-navy">
        You scored {score}%
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        {didPass
          ? "Well done — you've met the pass mark for this assessment."
          : "You didn't meet the pass mark this time. Review the lesson material and try again if attempts remain."}
      </p>
      <div className="mt-6 flex gap-3">
        <LinkButton href={`/learn/${slug}`} variant="secondary">
          Back to course
        </LinkButton>
        <LinkButton href={`/learn/${slug}/${lessonId}`}>Review lesson</LinkButton>
      </div>
    </div>
  );
}
