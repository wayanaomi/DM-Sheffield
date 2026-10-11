"use client";

import { useState } from "react";
import { Label, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addLesson } from "./actions";

const starterScenarioKeys = [
  "pump-vessel-fundamentals",
  "separator-level-control",
  "hazop-loss-of-flow",
];

export function AddLessonForm({ moduleId }: { moduleId: string }) {
  const [type, setType] = useState("rich_text");
  const action = addLesson.bind(null, moduleId);

  return (
    <form action={action} className="mt-3 space-y-3 rounded-md border border-dashed border-border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`title-${moduleId}`}>Lesson title</Label>
          <Input id={`title-${moduleId}`} name="title" required />
        </div>
        <div>
          <Label htmlFor={`type-${moduleId}`}>Type</Label>
          <select
            id={`type-${moduleId}`}
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            <option value="rich_text">Rich text</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="quiz">Quiz</option>
            <option value="simulation">Simulation</option>
          </select>
        </div>
      </div>

      {type === "rich_text" ? (
        <div>
          <Label htmlFor={`content-${moduleId}`}>Content</Label>
          <Textarea id={`content-${moduleId}`} name="content" rows={3} />
        </div>
      ) : null}

      {type === "simulation" ? (
        <div>
          <Label htmlFor={`scenario-${moduleId}`}>Scenario</Label>
          <select
            id={`scenario-${moduleId}`}
            name="scenarioKey"
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            {starterScenarioKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {type === "video" || type === "pdf" ? (
        <p className="text-xs text-muted">
          Asset upload is handled separately — this lesson will show an &quot;not yet
          uploaded&quot; state until an asset is attached.
        </p>
      ) : null}

      {type === "quiz" ? (
        <p className="text-xs text-muted">
          Create questions for this lesson&apos;s assessment after adding it.
        </p>
      ) : null}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="required" value="true" defaultChecked />
        Required for course completion
      </label>

      <Button type="submit" variant="secondary">
        Add lesson
      </Button>
    </form>
  );
}
