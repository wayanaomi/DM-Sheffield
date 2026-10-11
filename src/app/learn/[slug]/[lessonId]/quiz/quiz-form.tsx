"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuestionView {
  id: string;
  type: string;
  prompt: string;
  options: { id: string; text: string }[];
}

export function QuizForm({
  questions,
  onSubmit,
}: {
  questions: QuestionView[];
  onSubmit: (answers: { questionId: string; value: unknown }[]) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [pending, setPending] = useState(false);
  const router = useRouter();

  function setValue(questionId: string, value: unknown) {
    setValues((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    setPending(true);
    try {
      await onSubmit(
        questions.map((q) => ({ questionId: q.id, value: values[q.id] }))
      );
    } finally {
      setPending(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-lg border border-border p-5">
          <p className="text-sm font-semibold text-navy">
            {idx + 1}. {q.prompt}
          </p>
          <div className="mt-3 space-y-2">
            {q.type === "true_false" ? (
              <div className="flex gap-4">
                {[true, false].map((v) => (
                  <label key={String(v)} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      onChange={() => setValue(q.id, v)}
                    />
                    {v ? "True" : "False"}
                  </label>
                ))}
              </div>
            ) : q.type === "single_choice" ? (
              q.options.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={q.id} onChange={() => setValue(q.id, opt.id)} />
                  {opt.text}
                </label>
              ))
            ) : q.type === "multiple_choice" ? (
              q.options.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const current = (values[q.id] as string[] | undefined) ?? [];
                      setValue(
                        q.id,
                        e.target.checked ? [...current, opt.id] : current.filter((c) => c !== opt.id)
                      );
                    }}
                  />
                  {opt.text}
                </label>
              ))
            ) : q.type === "numeric" ? (
              <Input
                type="number"
                step="any"
                onChange={(e) => setValue(q.id, e.target.value)}
                className="max-w-xs"
              />
            ) : null}
          </div>
        </div>
      ))}
      <Button onClick={handleSubmit} disabled={pending}>
        {pending ? "Submitting…" : "Submit assessment"}
      </Button>
    </div>
  );
}
