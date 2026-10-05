import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/action-state";

/** Success / error message below a settings form. */
export function FormFeedback({ state }: { state: ActionState }) {
  if (state.status === "error") return <Alert variant="error">{state.message}</Alert>;
  if (state.status === "success" && state.message) {
    return <Alert variant="success">{state.message}</Alert>;
  }
  return null;
}
