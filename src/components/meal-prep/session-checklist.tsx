"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { toggleTask } from "@/features/meal-prep/actions";
import { taskProgress } from "@/lib/meal-prep/session";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

/** Combined cooking flow as a checklist. Every tick is saved immediately. */
export function SessionChecklist({
  sessionId,
  initialTasks,
  readOnly,
}: {
  sessionId: string;
  initialTasks: Task[];
  readOnly: boolean;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [error, setError] = useState<string | null>(null);
  const progress = taskProgress(tasks);

  async function toggle(task: Task) {
    const completed = !task.completed;
    setError(null);
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, completed } : t)));
    const result = await toggleTask({ sessionId, taskId: task.id, completed }).catch(() => null);
    if (!result?.ok) {
      setTasks((ts) => ts.map((t) => (t.id === task.id ? task : t)));
      setError(result?.message ?? "Keine Verbindung zum Server. Bitte erneut versuchen.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{progress} % abgeschlossen</span>
          <span className="text-muted-foreground">
            {tasks.filter((t) => t.completed).length} / {tasks.length} Schritte
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Fortschritt Meal Prep"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-2.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {error ? <Alert variant="error">{error}</Alert> : null}
      <ol className="grid gap-1.5">
        {tasks.map((task, index) => (
          <li key={task.id}>
            <label
              className={cn(
                "flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-ring",
                task.completed ? "bg-muted/60 text-muted-foreground" : "bg-card hover:bg-muted/40",
                readOnly && "cursor-default",
              )}
            >
              <input
                type="checkbox"
                className="mt-0.5 size-5 shrink-0 accent-[var(--primary)]"
                checked={task.completed}
                disabled={readOnly}
                onChange={() => toggle(task)}
              />
              <span className={cn(task.completed && "line-through")}>
                <span className="mr-1 text-muted-foreground tabular-nums">{index + 1}.</span>
                {task.title}
              </span>
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}
