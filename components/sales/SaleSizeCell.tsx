import { money, qty as fmtQty, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_MONO } from "../../lib/theme";
import HoverBreakdown, { type BreakdownRow } from "../ui/HoverBreakdown";
import type { BottleSize, SaleItem } from "../../lib/types";

/** Anything made of flavor lines priced per size: a sale, or the bottles that
 *  came back with a payment. */
export interface SizedBottleRecord {
  items: SaleItem[];
  largePrice: number;
  smallPrice: number;
}

interface SaleSizeCellProps {
  record: SizedBottleRecord;
  size: BottleSize;
  /** how the figure reads out, e.g. "bottles" or "bottles returned" */
  noun?: string;
  /** the card rendering: smaller type, but a full 44px tap target, since on a
   *  phone the breakdown is only reachable by touch */
  dense?: boolean;
  /** which edge the breakdown is pinned to — `right` suits a trailing column */
  align?: "left" | "right";
}

/**
 * A quantity at one bottle size, over its unit price, revealing the flavors
 * behind that figure on hover or tap (spec §13).
 *
 * Shared by the Sales & Distribution table and a distributor's own ledger so
 * the two read identically — the flavors belong to a quantity, and neither
 * table carries a Flavors column of its own. Bottles coming back are the same
 * shape as bottles going out, so returns render through this too.
 */
export default function SaleSizeCell({
  record,
  size,
  noun = "bottles",
  dense = false,
  align = "left",
}: SaleSizeCellProps) {
  const key = size === "LARGE" ? "large" : "small";
  const label = size === "LARGE" ? "Large" : "Small";
  const quantity = record.items.reduce((sum, i) => sum + i[key], 0);
  const unitPrice = size === "LARGE" ? record.largePrice : record.smallPrice;

  if (quantity === 0) {
    return (
      <span
        style={{ fontFamily: FONT_MONO, color: C.ink400 }}
        aria-label="Not included in this record"
      >
        {EMPTY_VALUE}
      </span>
    );
  }

  const rows: BreakdownRow[] = record.items
    .filter((i) => i[key] > 0)
    .map((i) => ({ label: i.flavor, value: fmtQty(i[key]) }));

  return (
    <HoverBreakdown
      trigger={
        <span className="block">
          <span
            className="block"
            style={{ fontFamily: FONT_MONO, color: C.ink900 }}
          >
            {fmtQty(quantity)}
          </span>
          <span
            className="block text-[11px]"
            style={{ fontFamily: FONT_MONO, color: C.ink400 }}
          >
            @ {money(unitPrice)}
          </span>
        </span>
      }
      title={`${label} ${noun} by flavor`}
      rows={rows}
      total={fmtQty(quantity)}
      ariaLabel={`${fmtQty(quantity)} ${label.toLowerCase()} ${noun}. Show breakdown by flavor`}
      align={align}
      triggerClassName={dense ? "text-[13px] min-h-11" : ""}
    />
  );
}
