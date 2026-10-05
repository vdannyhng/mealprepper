import { z } from "zod";
import { addDays, isIsoDate, isoWeekday } from "@/lib/dates";
import { Constants } from "@/types/database";

const isoDate = z.string().refine(isIsoDate, "Ungültiges Datum.");
const monday = isoDate.refine(
  (d) => isoWeekday(d) === 1,
  "Die Woche muss an einem Montag beginnen.",
);
const servings = z
  .number({ error: "Portionen müssen eine Zahl sein." })
  .min(0.25, "Mindestens 0.25 Portionen.")
  .max(20, "Höchstens 20 Portionen.");
const slot = z.enum(Constants.public.Enums.meal_slot);

const withinWeek = (weekStart: string, date: string) =>
  date >= weekStart && date <= addDays(weekStart, 6);

export const addPlannedMealSchema = z
  .object({
    weekStart: monday,
    date: isoDate,
    slot,
    recipeId: z.uuid("Ungültiges Rezept."),
    servings: servings.default(1),
  })
  .refine((v) => withinWeek(v.weekStart, v.date), {
    message: "Das Datum liegt ausserhalb der Woche.",
    path: ["date"],
  });

export const movePlannedMealSchema = z.object({
  id: z.uuid(),
  date: isoDate,
  slot,
});

export const plannedMealServingsSchema = z.object({
  id: z.uuid(),
  servings,
});

export const copyDaySchema = z
  .object({
    weekStart: monday,
    from: isoDate,
    to: z.array(isoDate).min(1, "Wähle mindestens einen Zieltag.").max(6),
    replace: z.boolean(),
  })
  .refine((v) => [v.from, ...v.to].every((d) => withinWeek(v.weekStart, d)), {
    message: "Es können nur Tage derselben Woche kopiert werden.",
    path: ["to"],
  });
