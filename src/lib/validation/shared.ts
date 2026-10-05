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

/** Optional free text: "" and whitespace-only become undefined. */
export function optionalText(max: number) {
  return z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max, `Maximal ${max} Zeichen.`).optional(),
  );
}

/** Optional select value: "" becomes undefined. */
export function optionalEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess((v) => (v === "" ? undefined : v), z.enum(values).optional());
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Route params are user input – check the format before querying. */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
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
