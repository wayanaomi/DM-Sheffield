"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, RotateCcw, Square } from "lucide-react";
import { SimulationEngine, type EngineSnapshot, type ScenarioDefinition } from "@dm-sheffield/simulator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiagramCanvas } from "./diagram-canvas";
import { InspectorPanel } from "./inspector-panel";
import { AlarmPanel } from "./alarm-panel";
import { ObjectivesPanel } from "./objectives-panel";
import { scenarioLayouts } from "./scenario-layouts";
import { RunSummary } from "./run-summary";

export function SimulatorWorkspace({
  scenario,
  lessonId,
  enrollmentId,
}: {
  scenario: ScenarioDefinition;
  lessonId?: string;
  enrollmentId?: string;
}) {
  const router = useRouter();
  // A stable engine instance for this component's lifetime, created once via
  // useState's lazy initializer (not a ref — refs must not be read during render).
  const [engine] = useState(() => new SimulationEngine(scenario));
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(() => engine.getSnapshot());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const layout = scenarioLayouts[scenario.id];

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function tick() {
    engine.step(1);
    const next = engine.getSnapshot();
    setSnapshot(next);
    if (next.complete) {
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setEnded(true);
    }
  }

  function handleStart() {
    engine.start();
    setIsRunning(true);
    setEnded(false);
    intervalRef.current = setInterval(tick, scenario.timeStepMs);
  }

  function handlePause() {
    engine.pause();
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    engine.applyAction({ type: "reset" });
    setSnapshot(engine.getSnapshot());
    setIsRunning(false);
    setEnded(false);
    setSaveState("idle");
    setSelectedTag(null);
  }

  function handleEndRun() {
    engine.pause();
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSnapshot(engine.getSnapshot());
    setEnded(true);
  }

  function act(action: Parameters<SimulationEngine["applyAction"]>[0]) {
    engine.applyAction(action);
    setSnapshot(engine.getSnapshot());
  }

  const instrumentDefs = useMemo(
    () => scenario.instruments.map((i) => ({ tag: i.tag, measures: i.measures })),
    [scenario]
  );
  const controllerDefs = useMemo(
    () =>
      Object.values(snapshot.controllers).map((c) => ({ tag: c.tag, mode: c.mode, sp: c.sp })),
    [snapshot.controllers]
  );

  async function handleSaveAttempt() {
    setSaveState("saving");
    try {
      const res = await fetch("/api/simulator/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioKey: scenario.id,
          seed: scenario.seed,
          actionLog: snapshot.actionLog,
          score: snapshot.score,
          passed: snapshot.passed,
          complete: snapshot.complete,
          durationMs: snapshot.elapsedMs,
          lessonId,
          enrollmentId,
        }),
      });
      if (!res.ok) throw new Error("Failed to save attempt");
      setSaveState("saved");
      router.refresh();
    } catch {
      setSaveState("error");
    }
  }

  const elapsedSeconds = Math.floor(snapshot.elapsedMs / 1000);

  if (ended) {
    return (
      <RunSummary
        scenario={scenario}
        snapshot={snapshot}
        saveState={saveState}
        onSaveAttempt={handleSaveAttempt}
        onRetry={handleReset}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {!isRunning ? (
              <Button onClick={handleStart}>
                <Play className="h-4 w-4" /> {snapshot.elapsedMs > 0 ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button variant="secondary" onClick={handlePause}>
                <Pause className="h-4 w-4" /> Pause
              </Button>
            )}
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="danger" onClick={handleEndRun}>
              <Square className="h-4 w-4" /> End run
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="blue">
              {String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:
              {String(elapsedSeconds % 60).padStart(2, "0")}
            </Badge>
            {scenario.timeLimitSeconds ? (
              <span className="text-xs text-muted">Limit {Math.round(scenario.timeLimitSeconds / 60)} min</span>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          {layout ? (
            <DiagramCanvas
              layout={layout}
              snapshot={snapshot}
              instrumentDefs={instrumentDefs}
              controllerDefs={controllerDefs}
              selectedTag={selectedTag}
              onSymbolClick={(tag) => setSelectedTag(tag)}
            />
          ) : (
            <p className="text-sm text-accent-red">No diagram layout is registered for this scenario.</p>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-navy">Event log</h3>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-tag text-xs text-muted">
            {snapshot.eventLog
              .slice()
              .reverse()
              .map((line, i) => (
                <li key={i}>{line}</li>
              ))}
          </ul>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-navy">Inspector</h3>
          <div className="mt-2">
            <InspectorPanel
              snapshot={snapshot}
              selectedTag={selectedTag}
              onTogglePump={(tag) => {
                const eq = snapshot.equipment[tag];
                const next = eq && eq.type === "pump" && eq.state === "on" ? "off" : "on";
                act({ type: "setPumpState", tag, state: next });
              }}
              onClearTrip={(tag) => act({ type: "clearTrip", tag })}
              onToggleManualValve={(tag) => {
                const eq = snapshot.equipment[tag];
                const next = eq && eq.type === "manual_valve" && eq.position > 0.05 ? 0 : 1;
                act({ type: "setValvePosition", tag, position: next });
              }}
              onSetControlValveMode={(tag, mode) => act({ type: "setValveMode", tag, mode })}
              onSetControlValvePosition={(tag, position) => act({ type: "setValvePosition", tag, position })}
              onSetControllerMode={(tag, mode) => act({ type: "setControllerMode", tag, mode })}
              onSetControllerSetpoint={(tag, sp) => act({ type: "setControllerSetpoint", tag, sp })}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-navy">Alarms</h3>
          <div className="mt-2">
            <AlarmPanel
              alarms={snapshot.alarms}
              onAck={(tag) => act({ type: "acknowledgeAlarm", tag })}
              onShelve={(tag) => act({ type: "shelveAlarm", tag })}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-navy">Objectives</h3>
          <div className="mt-2">
            <ObjectivesPanel tasks={snapshot.tasks} />
          </div>
        </div>
      </div>
    </div>
  );
}
