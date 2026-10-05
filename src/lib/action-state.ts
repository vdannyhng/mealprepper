import type { FieldErrors } from "@/lib/validation/shared";

/** Result of a Server Action, consumed by forms via useActionState. */
export type ActionState =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; message: string; fieldErrors?: FieldErrors };

export const IDLE: ActionState = { status: "idle" };

export function actionError(message: string, fieldErrors?: FieldErrors): ActionState {
  return { status: "error", message, fieldErrors };
}

export function actionSuccess(message?: string): ActionState {
  return { status: "success", message };
}
