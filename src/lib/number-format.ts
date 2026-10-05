/**
 * Swiss number formatting ("2’370", "1.5") implemented without Intl.
 * Node and browsers ship different ICU data (e.g. "'" vs "’" as group separator), which
 * breaks hydration when the same number is rendered on the server and the client.
 */
const GROUP_SEPARATOR = "’";

export function formatNumber(value: number, maxFractionDigits = 0): string {
  if (!Number.isFinite(value)) return "–";
  const factor = 10 ** maxFractionDigits;
  const rounded = Math.round((Math.abs(value) + Number.EPSILON) * factor) / factor;
  const [integer = "0", fraction] = rounded.toFixed(maxFractionDigits).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
  const trimmedFraction = fraction?.replace(/0+$/, "");
  const sign = value < 0 && rounded !== 0 ? "-" : "";
  return `${sign}${grouped}${trimmedFraction ? `.${trimmedFraction}` : ""}`;
}
