import type { DateRange } from "./types";

/**
 * Date helpers for the dashboard's month-to-date statistics.
 *
 * Business dates are plain ISO `yyyy-mm-dd` strings with no time component, so
 * every comparison here is a lexicographic string compare. That keeps the rules
 * timezone-proof: `"2026-08-01" <= "2026-08-17" <= "2026-08-24"` holds no matter
 * where the browser is, which a `Date`-based comparison cannot promise once
 * UTC offsets get involved.
 */

/** Formats a local Date as `yyyy-mm-dd` (local calendar day, not UTC). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * The dashboard reporting period: the first day of the current month through
 * today, inclusive.
 *
 * Deliberately NOT "the last 30 days" and NOT the whole calendar month
 * including future dates — on 15 Aug 2026 this returns 2026-08-01 → 2026-08-15.
 */
export function monthToDate(today: Date = new Date()): DateRange {
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { start: toISODate(start), end: toISODate(today) };
}

/** True when an ISO business date falls inside the range, both ends inclusive. */
export function isWithin(date: string, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

/** Sums `amount` over the records whose `date` falls in the range. */
export function sumInPeriod<T extends { date: string }>(
  records: readonly T[],
  range: DateRange,
  amount: (record: T) => number,
): number {
  return records.reduce((total, r) => (isWithin(r.date, range) ? total + amount(r) : total), 0);
}

/** Human label for a range, e.g. "1 – 24 Aug". Used as stat-card subtext. */
export function periodLabel(range: DateRange): string {
  const start = new Date(`${range.start}T00:00:00`);
  const end = new Date(`${range.end}T00:00:00`);
  const month = end.toLocaleDateString("en-GB", { month: "short" });
  return `${start.getDate()} – ${end.getDate()} ${month}`;
}
