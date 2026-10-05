const integerFormat = new Intl.NumberFormat("de-CH", { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat("de-CH", { maximumFractionDigits: 1 });

/** Whole kilocalories with Swiss digit grouping. */
export function formatKcal(value: number): string {
  return integerFormat.format(value);
}

/** Grams: whole numbers from 10 g upwards, one decimal below. */
export function formatGrams(value: number): string {
  return Math.abs(value) >= 10 ? integerFormat.format(value) : decimalFormat.format(value);
}
