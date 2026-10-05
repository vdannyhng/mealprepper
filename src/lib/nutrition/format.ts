import { formatNumber } from "@/lib/number-format";

/** Whole kilocalories with Swiss digit grouping. */
export function formatKcal(value: number): string {
  return formatNumber(value);
}

/** Grams: whole numbers from 10 g upwards, one decimal below. */
export function formatGrams(value: number): string {
  return formatNumber(value, Math.abs(value) >= 10 ? 0 : 1);
}
