import { returnTotals } from "../../lib/salesUtils";
import { money, qty as fmtQty, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_MONO } from "../../lib/theme";
import HoverBreakdown, { type BreakdownRow } from "../ui/HoverBreakdown";
import type { IncomePayment } from "../../lib/types";

interface ReturnedBottlesCellProps {
  payment: IncomePayment;
  /** the card rendering: smaller type, but a full 44px tap target, since on a
   *  phone the breakdown is only reachable by touch */
  dense?: boolean;
}

/**
 * The bottles a payment brought back: the count, with the flavor and size
 * split behind it and the credit they earned.
 *
 * Shared by the Income register and a distributor's own payment history, so
 * the same payment reads identically wherever it is listed.
 */
export default function ReturnedBottlesCell({
  payment,
  dense = false,
}: ReturnedBottlesCellProps) {
  const totals = returnTotals(payment);

  if (totals.qty === 0) {
    return (
      <span style={{ fontFamily: FONT_MONO, color: C.ink400 }} aria-label="Nothing returned">
        {EMPTY_VALUE}
      </span>
    );
  }

  const rows: BreakdownRow[] = payment.returns.map((r) => ({
    label: r.flavor,
    value: [r.large ? `${fmtQty(r.large)} large` : "", r.small ? `${fmtQty(r.small)} small` : ""]
      .filter(Boolean)
      .join(" · "),
  }));

  return (
    <HoverBreakdown
      trigger={<span style={{ fontFamily: FONT_MONO }}>{fmtQty(totals.qty)}</span>}
      title="Bottles returned by flavor"
      rows={rows}
      total={`${fmtQty(totals.qty)} · ${money(totals.totalAmt)}`}
      totalLabel="Credited"
      ariaLabel={`${fmtQty(totals.qty)} bottles returned. Show breakdown by flavor`}
      triggerClassName={dense ? "text-[13px] min-h-11" : ""}
    />
  );
}
