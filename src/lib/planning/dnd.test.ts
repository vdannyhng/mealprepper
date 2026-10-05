import { describe, expect, it } from "vitest";
import { DND_MIME, hasDragPayload, readDragPayload, writeDragPayload } from "./dnd";

/** Minimal DataTransfer stand-in (the Node test environment has no DOM). */
function fakeDataTransfer(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    effectAllowed: "uninitialized",
    get types() {
      return [...data.keys()];
    },
    setData: (type: string, value: string) => void data.set(type, value),
    getData: (type: string) => data.get(type) ?? "",
  } as unknown as DataTransfer;
}

describe("drag payloads", () => {
  it("round-trips a recipe payload and allows copying", () => {
    const dt = fakeDataTransfer();
    writeDragPayload(dt, { kind: "recipe", recipeId: "r1" });
    expect(hasDragPayload(dt)).toBe(true);
    expect(dt.effectAllowed).toBe("copy");
    expect(readDragPayload(dt)).toEqual({ kind: "recipe", recipeId: "r1" });
  });

  it("round-trips a meal payload and allows moving", () => {
    const dt = fakeDataTransfer();
    writeDragPayload(dt, { kind: "meal", mealId: "m1" });
    expect(dt.effectAllowed).toBe("move");
    expect(readDragPayload(dt)).toEqual({ kind: "meal", mealId: "m1" });
  });

  it("ignores foreign or malformed drags", () => {
    expect(hasDragPayload(fakeDataTransfer({ "text/plain": "hello" }))).toBe(false);
    expect(readDragPayload(fakeDataTransfer({ [DND_MIME]: "not json" }))).toBeNull();
    expect(
      readDragPayload(fakeDataTransfer({ [DND_MIME]: '{"kind":"meal","mealId":5}' })),
    ).toBeNull();
    expect(readDragPayload(fakeDataTransfer({ [DND_MIME]: "null" }))).toBeNull();
  });
});
