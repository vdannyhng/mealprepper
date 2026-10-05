/** Drag-and-drop payloads of the weekly planner (HTML5 DataTransfer). */
export const DND_MIME = "application/x-mealprepper";

export type DragPayload = { kind: "recipe"; recipeId: string } | { kind: "meal"; mealId: string };

export function writeDragPayload(dataTransfer: DataTransfer, payload: DragPayload) {
  dataTransfer.setData(DND_MIME, JSON.stringify(payload));
  dataTransfer.effectAllowed = payload.kind === "recipe" ? "copy" : "move";
}

export function hasDragPayload(dataTransfer: DataTransfer): boolean {
  return dataTransfer.types.includes(DND_MIME);
}

export function readDragPayload(dataTransfer: DataTransfer): DragPayload | null {
  try {
    const value: unknown = JSON.parse(dataTransfer.getData(DND_MIME));
    if (typeof value !== "object" || value === null) return null;
    const v = value as Record<string, unknown>;
    if (v.kind === "recipe" && typeof v.recipeId === "string") {
      return { kind: "recipe", recipeId: v.recipeId };
    }
    if (v.kind === "meal" && typeof v.mealId === "string")
      return { kind: "meal", mealId: v.mealId };
    return null;
  } catch {
    return null;
  }
}
