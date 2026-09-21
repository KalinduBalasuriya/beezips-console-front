import { saleTotals } from "../../lib/salesUtils";
import { money, qty as fmtQty, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_MONO } from "../../lib/theme";
import HoverBreakdown, { type BreakdownRow } from "../ui/HoverBreakdown";
import type { BottleSize, Sale } from "../../lib/types";

interface SaleSizeCellProps {
  sale: Sale;
  size: BottleSize;
  /** the card rendering: smaller type, but a full 44px tap target, since on a
   *  phone the breakdown is only reachable by touch */
  dense?: boolean;
  /** which edge the breakdown is pinned to — `right` suits a trailing column */
  align?: "left" | "right";
}

/**
 * One sale's quantity at one bottle size, over its unit price, revealing the
 * flavors behind that figure on hover or tap (spec §13).
 *
 * Shared by the Sales & Distribution table and a distributor's own sales
 * history so the two read identically — the flavors belong to a quantity, and
 * neither table carries a Flavors column of its own.
 */
export default function SaleSizeCell({
  sale,
  size,
  dense = false,
  align = "left",
}: SaleSizeCellProps) {
  const key = size === "LARGE" ? "large" : "small";
  const label = size === "LARGE" ? "Large" : "Small";
  const totals = saleTotals(sale);
  const quantity = size === "LARGE" ? totals.large : totals.small;
  const unitPrice = size === "LARGE" ? sale.largePrice : sale.smallPrice;

  if (quantity === 0) {
    return (
      <span
        style={{ fontFamily: FONT_MONO, color: C.ink400 }}
        aria-label="Not included in this sale"
      >
        {EMPTY_VALUE}
      </span>
    );
  }

  const rows: BreakdownRow[] = sale.items
    .filter((i) => i[key] > 0)
    .map((i) => ({ label: i.flavor, value: fmtQty(i[key]) }));

  return (
    <HoverBreakdown
      trigger={
        <span className="block">
          <span className="block" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
            {fmtQty(quantity)}
          </span>
          <span className="block text-[11px]" style={{ fontFamily: FONT_MONO, color: C.ink400 }}>
            @ {money(unitPrice)}
          </span>
        </span>
      }
      title={`${label} bottles by flavor`}
      rows={rows}
      total={fmtQty(quantity)}
      ariaLabel={`${fmtQty(quantity)} ${label.toLowerCase()} bottles. Show breakdown by flavor`}
      align={align}
      triggerClassName={dense ? "text-[13px] min-h-11" : ""}
    />
  );
}
