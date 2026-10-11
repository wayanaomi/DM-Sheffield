"use client";

import type { EngineSnapshot } from "@dm-sheffield/simulator";
import { Button } from "@/components/ui/button";

export function InspectorPanel({
  snapshot,
  selectedTag,
  onTogglePump,
  onClearTrip,
  onToggleManualValve,
  onSetControlValveMode,
  onSetControlValvePosition,
  onSetControllerMode,
  onSetControllerSetpoint,
}: {
  snapshot: EngineSnapshot;
  selectedTag: string | null;
  onTogglePump: (tag: string) => void;
  onClearTrip: (tag: string) => void;
  onToggleManualValve: (tag: string) => void;
  onSetControlValveMode: (tag: string, mode: "auto" | "manual") => void;
  onSetControlValvePosition: (tag: string, position: number) => void;
  onSetControllerMode: (tag: string, mode: "auto" | "manual") => void;
  onSetControllerSetpoint: (tag: string, sp: number) => void;
}) {
  if (!selectedTag) {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted">
        Select an item on the diagram to inspect it and, where permitted, operate it.
      </div>
    );
  }

  const equipment = snapshot.equipment[selectedTag];
  const controller = snapshot.controllers[selectedTag];

  if (controller) {
    return (
      <div className="rounded-lg border border-border p-4">
        <p className="font-tag text-xs font-semibold text-navy">{controller.tag}</p>
        <p className="mt-1 text-xs text-muted">PID controller · PV {controller.pv} → OUT {controller.out}</p>
        <div className="mt-3 flex gap-2">
          <Button
            variant={controller.mode === "auto" ? "primary" : "secondary"}
            onClick={() => onSetControllerMode(controller.tag, "auto")}
          >
            Auto
          </Button>
          <Button
            variant={controller.mode === "manual" ? "primary" : "secondary"}
            onClick={() => onSetControllerMode(controller.tag, "manual")}
          >
            Manual
          </Button>
        </div>
        <label className="mt-4 block text-xs font-medium text-muted">
          Setpoint: {Math.round(controller.sp * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={controller.sp * 100}
          onChange={(e) => onSetControllerSetpoint(controller.tag, Number(e.target.value) / 100)}
          className="mt-1 w-full"
        />
      </div>
    );
  }

  if (!equipment) return null;

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="font-tag text-xs font-semibold text-navy">{selectedTag}</p>
      <p className="mt-1 text-xs text-muted">
        {equipment.label ?? equipment.type.replace("_", " ")}
      </p>

      {equipment.type === "pump" ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted">State: <span className="font-medium text-ink">{equipment.state}</span></p>
          {equipment.state === "tripped" ? (
            <Button variant="danger" onClick={() => onClearTrip(selectedTag)}>
              Clear trip
            </Button>
          ) : (
            <Button onClick={() => onTogglePump(selectedTag)}>
              {equipment.state === "on" ? "Stop pump" : "Start pump"}
            </Button>
          )}
        </div>
      ) : null}

      {equipment.type === "manual_valve" ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted">
            Position: <span className="font-medium text-ink">{Math.round(equipment.position * 100)}%</span>
            {equipment.stuck ? <span className="ml-2 text-accent-yellow">Mechanically stuck</span> : null}
          </p>
          <Button disabled={equipment.stuck} onClick={() => onToggleManualValve(selectedTag)}>
            {equipment.position > 0.05 ? "Close valve" : "Open valve"}
          </Button>
        </div>
      ) : null}

      {equipment.type === "control_valve" ? (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-muted">
            Position: <span className="font-medium text-ink">{Math.round(equipment.position * 100)}%</span>
            {equipment.stuck ? <span className="ml-2 text-accent-yellow">Mechanically stuck</span> : null}
          </p>
          <div className="flex gap-2">
            <Button
              variant={equipment.mode === "auto" ? "primary" : "secondary"}
              onClick={() => onSetControlValveMode(selectedTag, "auto")}
            >
              Auto
            </Button>
            <Button
              variant={equipment.mode === "manual" ? "primary" : "secondary"}
              onClick={() => onSetControlValveMode(selectedTag, "manual")}
            >
              Manual
            </Button>
          </div>
          {equipment.mode === "manual" ? (
            <input
              type="range"
              min={0}
              max={100}
              disabled={equipment.stuck}
              defaultValue={equipment.position * 100}
              onChange={(e) => onSetControlValvePosition(selectedTag, Number(e.target.value) / 100)}
              className="w-full"
            />
          ) : (
            <p className="text-xs text-muted">Position is driven automatically by its controller.</p>
          )}
        </div>
      ) : null}

      {equipment.type === "vessel" ? (
        <p className="mt-3 text-xs text-muted">
          Level {Math.round(equipment.level * 100)}% · Pressure {(snapshot.nodePressures[selectedTag] ?? 0).toFixed(2)} bar
        </p>
      ) : null}
    </div>
  );
}
