export function money(n: number | string | null | undefined): string {
  const v = Number(n) || 0;
  return v.toLocaleString("en-LK", { maximumFractionDigits: 0 }) + "Rs";
}

/** Plain integer with thousands separators, e.g. `1,900`. */
export function qty(n: number | string | null | undefined): string {
  const v = Number(n) || 0;
  return v.toLocaleString("en-LK", { maximumFractionDigits: 0 });
}

/** Compact business date for dense table cells and cards, e.g. `17 Aug`. */
export function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Full numeric business date, e.g. `08/17/2026`. */
export function fullDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

/** Placeholder for a value a record genuinely doesn't have (spec §42). */
export const EMPTY_VALUE = "—";
