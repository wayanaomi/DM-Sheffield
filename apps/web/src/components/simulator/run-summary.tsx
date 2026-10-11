"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { EngineSnapshot, ScenarioDefinition } from "@dm-sheffield/simulator";
import { Button, LinkButton } from "@/components/ui/button";
import { ObjectivesPanel } from "./objectives-panel";

export function RunSummary({
  scenario,
  snapshot,
  saveState,
  onSaveAttempt,
  onRetry,
}: {
  scenario: ScenarioDefinition;
  snapshot: EngineSnapshot;
  saveState: "idle" | "saving" | "saved" | "error";
  onSaveAttempt: () => void;
  onRetry: () => void;
}) {
  const triggeredAlarms = snapshot.alarms.filter((a) => a.activatedAtMs !== undefined);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center text-center">
        {snapshot.passed ? (
          <CheckCircle2 className="h-12 w-12 text-signal-normal" />
        ) : (
          <XCircle className="h-12 w-12 text-accent-red" />
        )}
        <h2 className="mt-3 text-xl font-semibold text-navy">
          {snapshot.passed ? "Objectives achieved" : "Run ended"}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          {snapshot.passed ? scenario.completionFeedback.onPass : scenario.completionFeedback.onFail}
        </p>
        <p className="mt-3 text-xs text-muted">
          Practice score (feedback only, not a formal grade): <strong>{snapshot.score}/100</strong>
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-navy">Objectives</h3>
          <div className="mt-2">
            <ObjectivesPanel tasks={snapshot.tasks} />
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-navy">Alarms triggered</h3>
          {triggeredAlarms.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No alarms were triggered during this run.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-ink">
              {triggeredAlarms.map((a) => (
                <li key={a.tag}>
                  <span className="font-tag">{a.tag}</span> — {a.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={onSaveAttempt} disabled={saveState === "saving" || saveState === "saved"}>
          {saveState === "saved" ? "Run saved" : saveState === "saving" ? "Saving…" : "Save this run"}
        </Button>
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
        <LinkButton variant="ghost" href="/simulator">
          Back to scenarios
        </LinkButton>
      </div>
      {saveState === "error" ? (
        <p className="mt-3 text-center text-xs text-accent-red">
          Sign in to save your simulation history, or try again.
        </p>
      ) : null}
    </div>
  );
}
