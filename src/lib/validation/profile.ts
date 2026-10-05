import { z } from "zod";
import { Constants } from "@/types/database";
import { optionalEnum, optionalNumber } from "./shared";

const enums = Constants.public.Enums;

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Name ist erforderlich.").max(80, "Maximal 80 Zeichen."),
  goal: optionalEnum(enums.goal_type),
  sex: optionalEnum(enums.sex_type),
  birthYear: optionalNumber("Geburtsjahr", {
    min: 1920,
    max: new Date().getFullYear() - 14,
    int: true,
  }),
  weightKg: optionalNumber("Gewicht", { min: 30, max: 300 }),
  heightCm: optionalNumber("Körpergrösse", { min: 120, max: 230 }),
  activityLevel: optionalEnum(enums.activity_level),
});
export type ProfileInput = z.infer<typeof profileSchema>;
