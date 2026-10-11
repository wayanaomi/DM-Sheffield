"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateLessonProgress } from "../actions";

export function VideoLessonPlayer({
  enrollmentId,
  lessonId,
  src,
  thresholdPercent,
  initialCompleted,
}: {
  enrollmentId: string;
  lessonId: string;
  src: string;
  thresholdPercent: number;
  initialCompleted: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [completed, setCompleted] = useState(initialCompleted);
  const [, startTransition] = useTransition();
  const lastReported = useRef(0);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const percent = (video.currentTime / video.duration) * 100;
    if (percent - lastReported.current < 2 && percent < 99) return;
    lastReported.current = percent;
    startTransition(async () => {
      await updateLessonProgress(enrollmentId, lessonId, {
        percent,
        lastPositionSeconds: Math.floor(video.currentTime),
      });
      if (percent >= thresholdPercent * 100) setCompleted(true);
    });
  }

  return (
    <div>
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full rounded-lg border border-border bg-black"
        onTimeUpdate={handleTimeUpdate}
      />
      <p className="mt-2 text-xs text-muted">
        {completed
          ? "Marked complete."
          : `Watch to ${Math.round(thresholdPercent * 100)}% to mark this lesson complete.`}
      </p>
    </div>
  );
}

export function MarkCompleteButton({
  enrollmentId,
  lessonId,
  initialCompleted,
  label = "Mark as complete",
}: {
  enrollmentId: string;
  lessonId: string;
  initialCompleted: boolean;
  label?: string;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  if (completed) {
    return <p className="text-sm font-medium text-signal-normal">Completed</p>;
  }

  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await updateLessonProgress(enrollmentId, lessonId, { percent: 100, markComplete: true });
          setCompleted(true);
        })
      }
    >
      {pending ? "Saving…" : label}
    </Button>
  );
}
