"use client";

import { AlertTriangle, BellOff } from "lucide-react";
import type { AlarmState } from "@dm-sheffield/simulator";
import { cn } from "@/lib/cn";

const priorityColor: Record<string, string> = {
  low: "text-muted",
  medium: "text-accent-yellow",
  high: "text-accent-red",
  critical: "text-accent-red",
};

export function AlarmPanel({
  alarms,
  onAck,
  onShelve,
}: {
  alarms: AlarmState[];
  onAck: (tag: string) => void;
  onShelve: (tag: string) => void;
}) {
  if (alarms.length === 0) {
    return <p className="text-sm text-muted">This scenario has no configured alarms.</p>;
  }

  return (
    <ul className="space-y-2">
      {alarms.map((alarm) => (
        <li
          key={alarm.tag}
          className={cn(
            "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
            alarm.active && !alarm.acknowledged ? "border-accent-red-bg bg-accent-red-bg" : "border-border"
          )}
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className={cn("h-4 w-4", alarm.active ? priorityColor[alarm.priority] : "text-muted")} />
            <span>
              <span className="font-tag font-medium text-ink">{alarm.tag}</span>{" "}
              <span className="text-xs text-muted">{alarm.label}</span>
            </span>
          </span>
          {alarm.active ? (
            <div className="flex items-center gap-2">
              {!alarm.acknowledged ? (
                <button onClick={() => onAck(alarm.tag)} className="text-xs font-medium text-blue">
                  Acknowledge
                </button>
              ) : (
                <span className="text-xs text-muted">Acknowledged</span>
              )}
              <button onClick={() => onShelve(alarm.tag)} aria-label="Shelve alarm" className="text-muted hover:text-blue">
                <BellOff className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-muted">Normal</span>
          )}
        </li>
      ))}
    </ul>
  );
}
