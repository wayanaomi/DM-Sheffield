"use client";

import { CheckCircle2, XCircle, Circle } from "lucide-react";
import type { TaskProgress } from "@dm-sheffield/simulator";
import { cn } from "@/lib/cn";

export function ObjectivesPanel({ tasks }: { tasks: TaskProgress[] }) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-2 text-sm">
          {task.satisfied ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-signal-normal" />
          ) : task.failed ? (
            <XCircle className="mt-0.5 h-4 w-4 flex-none text-accent-red" />
          ) : (
            <Circle className="mt-0.5 h-4 w-4 flex-none text-muted" />
          )}
          <span className={cn(task.failed && "text-accent-red", task.satisfied && "text-signal-normal")}>
            {task.text} <span className="text-xs text-muted">({task.weight}%)</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
