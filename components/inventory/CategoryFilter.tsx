import { C, FONT_BODY } from "../../lib/theme";
import type { InventoryCategory } from "../../lib/types";

type Value = InventoryCategory | "All";

interface CategoryFilterProps {
  categories: readonly InventoryCategory[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
  /** accessible name for the group, e.g. "Filter inventory by category" */
  label: string;
}

/**
 * Inventory category chips — All plus every configured category, including
 * Finished Goods (spec §22). Shared by the dashboard snapshot and the full
 * Inventory page so both offer the same filters with the same treatment.
 */
export default function CategoryFilter({
  categories,
  value,
  onChange,
  className = "",
  label,
}: CategoryFilterProps) {
  const options: Value[] = ["All", ...categories];

  return (
    /* scrolls sideways on a phone rather than wrapping into cramped rows */
    <div
      role="group"
      aria-label={label}
      className={`flex items-center gap-1.5 overflow-x-auto scroll-touch -mx-3 px-3 pb-1 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:overflow-visible ${className}`}
    >
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            aria-pressed={active}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold shrink-0 whitespace-nowrap transition-colors sm:px-3.5 sm:py-2 sm:text-xs"
            style={{
              fontFamily: FONT_BODY,
              background: active ? C.brand : C.card,
              color: active ? C.ink900 : C.ink600,
              border: `1px solid ${active ? C.brand : C.line}`,
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
