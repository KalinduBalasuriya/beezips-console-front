import { periodLabel } from "../../lib/period";
import { C, FONT_BODY } from "../../lib/theme";
import type { DateRange } from "../../lib/types";

interface PeriodToggleProps {
  monthOnly: boolean;
  onChange: (monthOnly: boolean) => void;
  range: DateRange;
}

/** Switches a finance page between the dashboard's month-to-date window and
 *  the full history, so a card's figure can be traced to its records. */
export default function PeriodToggle({ monthOnly, onChange, range }: PeriodToggleProps) {
  const options: { label: string; value: boolean }[] = [
    { label: `This month (${periodLabel(range)})`, value: true },
    { label: "All time", value: false },
  ];

  return (
    <div
      role="group"
      aria-label="Filter by period"
      className="flex items-center gap-1.5 mb-3 overflow-x-auto scroll-touch -mx-3 px-3 pb-1 sm:mx-0 sm:px-0 sm:pb-0 sm:mb-5"
    >
      {options.map((o) => {
        const active = monthOnly === o.value;
        return (
          <button
            key={o.label}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold shrink-0 whitespace-nowrap transition-colors sm:px-3.5 sm:py-2 sm:text-xs"
            style={{
              fontFamily: FONT_BODY,
              background: active ? C.brand : C.card,
              color: active ? C.ink900 : C.ink600,
              border: `1px solid ${active ? C.brand : C.line}`,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
