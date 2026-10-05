import type { Enums } from "@/types/database";

export const PREP_STATUS_LABELS: Record<Enums<"prep_session_status">, string> = {
  planned: "Geplant",
  in_progress: "Läuft",
  completed: "Abgeschlossen ✅",
  cancelled: "Verworfen",
};
