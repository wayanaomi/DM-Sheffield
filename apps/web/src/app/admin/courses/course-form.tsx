"use client";

import { useState } from "react";
import { Label, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, LEVEL_LABELS } from "@/lib/enums";
import type { Course } from "@prisma/client";

export function CourseForm({
  course,
  onSubmit,
}: {
  course?: Course;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const [isFree, setIsFree] = useState(course?.isFree ?? true);

  return (
    <form action={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="title">Course title</Label>
        <Input id="title" name="title" defaultValue={course?.title} required minLength={3} />
      </div>
      <div>
        <Label htmlFor="summary">Short summary</Label>
        <Textarea id="summary" name="summary" defaultValue={course?.summary} required minLength={10} rows={2} />
      </div>
      <div>
        <Label htmlFor="description">Full description (overview)</Label>
        <Textarea id="description" name="description" defaultValue={course?.description} rows={6} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={course?.category ?? "process_safety"}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            name="level"
            defaultValue={course?.level ?? "beginner"}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            {Object.entries(LEVEL_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="isFree"
            value="true"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
          />
          This course is free
        </label>
        {!isFree ? (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceMinor">Price (in kobo / cents)</Label>
              <Input
                id="priceMinor"
                name="priceMinor"
                type="number"
                min={0}
                defaultValue={course?.priceMinor ?? 0}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                name="currency"
                defaultValue={course?.currency ?? "NGN"}
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        ) : (
          <input type="hidden" name="priceMinor" value={0} />
        )}
        {isFree ? <input type="hidden" name="currency" value={course?.currency ?? "NGN"} /> : null}
      </div>

      <div className="space-y-2 rounded-lg border border-border p-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="certificateEnabled" value="true" defaultChecked={course?.certificateEnabled ?? true} />
          Issue a certificate on completion
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="requireAssessmentPass"
            value="true"
            defaultChecked={course?.requireAssessmentPass ?? false}
          />
          Require a passed assessment before certificate issuance (off by default — completion only)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="sequentialUnlock" value="true" defaultChecked={course?.sequentialUnlock ?? true} />
          Enforce sequential lesson unlocking
        </label>
      </div>

      <Button type="submit">{course ? "Save changes" : "Create course"}</Button>
    </form>
  );
}
