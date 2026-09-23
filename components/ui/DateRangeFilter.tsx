"use client";

import { C, FONT_BODY } from "../../lib/theme";
import type { DateRange } from "../../lib/types";

interface DateRangeFilterProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
  /** restores whatever the page considers its default window */
  onReset?: () => void;
  resetLabel?: string;
}

/**
 * A from/to date window.
 *
 * Both ends are inclusive, matching `isWithin` and every period figure in the
 * app: picking the 1st and today gives exactly the month-to-date window the
 * dashboard cards report, so a card's figure can be reproduced here.
 */
export default function DateRangeFilter({
  range,
  onChange,
  onReset,
  resetLabel = "This month",
}: DateRangeFilterProps) {
  const field = (
    label: string,
    value: string,
    set: (v: string) => void,
    bounds: { min?: string; max?: string },
  ) => (
    <label className="flex items-center gap-1.5 min-w-0">
      <span
        className="text-[11px] font-medium shrink-0 sm:text-xs"
        style={{ fontFamily: FONT_BODY, color: C.ink600 }}
      >
        {label}
      </span>
      <input
        type="date"
        value={value}
        min={bounds.min}
        max={bounds.max}
        onChange={(e) => e.target.value && set(e.target.value)}
        className="rounded-lg px-2.5 py-1.5 min-h-10 text-[13px] outline-none min-w-0 sm:text-sm"
        style={{
          fontFamily: FONT_BODY,
          color: C.ink900,
          background: C.card,
          border: `1px solid ${C.line}`,
        }}
      />
    </label>
  );

  return (
    <div
      role="group"
      aria-label="Filter by date range"
      className="flex flex-wrap items-center gap-2 mb-3 sm:gap-3 sm:mb-5"
    >
      {/* each end bounds the other, so the window can never invert */}
      {field("From", range.start, (start) => onChange({ ...range, start }), {
        max: range.end,
      })}
      {field("To", range.end, (end) => onChange({ ...range, end }), {
        min: range.start,
      })}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-full px-3 py-1.5 min-h-10 text-[11px] font-semibold shrink-0 whitespace-nowrap transition-colors hover:bg-black/5 sm:text-xs"
          style={{
            fontFamily: FONT_BODY,
            color: C.brandInk,
            border: `1px solid ${C.line}`,
          }}
        >
          {resetLabel}
        </button>
      )}
    </div>
  );
}
