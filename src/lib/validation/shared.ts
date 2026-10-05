import { z } from "zod";

/** Form fields arrive as strings; "" means "not provided", other strings are parsed as numbers. */
function toNumberOrUndefined(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim().replace(",", ".");
    return trimmed === "" ? undefined : Number(trimmed);
  }
  return value;
}

interface NumberOptions {
  min: number;
  max: number;
  int?: boolean;
}

function numberSchema(label: string, { min, max, int }: NumberOptions) {
  let schema = z
    .number({
      error: (issue) =>
        issue.input === undefined ? `${label} ist erforderlich.` : `${label} muss eine Zahl sein.`,
    })
    .min(min, `${label} muss mindestens ${min} sein.`)
    .max(max, `${label} darf höchstens ${max} sein.`);
  if (int) schema = schema.int(`${label} muss eine ganze Zahl sein.`);
  return schema;
}

export function requiredNumber(label: string, opts: NumberOptions) {
  return z.preprocess(toNumberOrUndefined, numberSchema(label, opts));
}

export function optionalNumber(label: string, opts: NumberOptions) {
  return z.preprocess(toNumberOrUndefined, numberSchema(label, opts).optional());
}

/** Field errors keyed by field path ("targets.calories"), ready for forms. */
export type FieldErrors = Record<string, string[] | undefined>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_form";
    (result[key] ??= []).push(issue.message);
  }
  return result;
}
