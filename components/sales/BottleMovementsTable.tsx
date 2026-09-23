import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { distributorRoute } from "../../lib/routes";
import { money, shortDate, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import SaleSizeCell from "./SaleSizeCell";
import type { DistributorMovement } from "../../lib/selectors";

interface BottleMovementsTableProps {
  movements: DistributorMovement[];
  emptyMessage: string;
  /** on the dashboard the rows span every account, so each names its own */
  showDistributor?: boolean;
  /** a closing figure under the table, e.g. stock value after returns */
  footer?: { label: string; value: string };
  /** where the card layout gives way to the table */
  cardBreakpoint?: "md" | "lg";
}

/** Green going out, red coming back — and never colour alone: each row also
 *  says which way it went, for anyone who cannot tell the two hues apart. */
const TONE = {
  ISSUE: { fg: C.success, label: "Issued", Icon: ArrowUpRight },
  RETURN: { fg: C.danger, label: "Returned", Icon: ArrowDownLeft },
} as const;

/**
 * The bottle ledger: every issue and every return, newest first.
 *
 * Stock leaves the factory unpaid and unsold bottles come back days later with
 * a payment, so both directions are records of the same kind and belong in one
 * sequence. An issue carries a stock value, a return carries a returned bottle
 * value, and the two sit in columns of their own rather than being added into a
 * figure that hides which way the bottles went.
 *
 * No Flavors column — each quantity reveals its own flavors on hover or tap.
 *
 * Shared by a distributor's own page, where it is filtered to one account and
 * closes with that account's total, and by the dashboard, where it spans every
 * account and names each one.
 */
export default function BottleMovementsTable({
  movements,
  emptyMessage,
  showDistributor = false,
  footer,
  cardBreakpoint = "lg",
}: BottleMovementsTableProps) {
  const hide = cardBreakpoint === "md" ? "md:hidden" : "lg:hidden";
  const show = cardBreakpoint === "md" ? "hidden md:block" : "hidden lg:block";

  /** which way the bottles went, said in words as well as in colour */
  const kindLabel = (m: DistributorMovement) => {
    const { fg, label, Icon } = TONE[m.kind];
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap"
        style={{ color: fg }}
      >
        <Icon size={11} aria-hidden /> {label}
      </span>
    );
  };

  const nameCell = (m: DistributorMovement) => (
    <Link
      href={distributorRoute(m.distributor)}
      className="font-medium hover:underline"
      style={{ color: C.brandInk }}
    >
      {m.distributor}
    </Link>
  );

  /** the value of the movement, in the column that belongs to its direction */
  const valueCell = (m: DistributorMovement, kind: DistributorMovement["kind"]) => {
    if (m.kind !== kind) {
      return <span style={{ fontFamily: FONT_MONO, color: C.ink400 }}>{EMPTY_VALUE}</span>;
    }
    return (
      <span style={{ fontFamily: FONT_MONO, color: TONE[kind].fg, fontWeight: 600 }}>
        {money(m.amount)}
      </span>
    );
  };

  /** the flavors on a return read as "bottles returned" in its breakdown */
  const noun = (m: DistributorMovement) =>
    m.kind === "RETURN" ? "bottles returned" : "bottles";

  const headers = [
    "Date",
    ...(showDistributor ? ["Distributor"] : []),
    "Large",
    "Small",
    "Stock value",
    "Returned bottle value",
  ];

  return (
    <>
      {/* mobile / tablet: one card per movement */}
      <div className={`${hide} space-y-2.5`}>
        {movements.length === 0 && (
          <p
            className="rounded-xl px-4 py-6 text-center text-[13px]"
            style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink400 }}
          >
            {emptyMessage}
          </p>
        )}
        {movements.map((m) => (
          <div
            key={m.id}
            className="rounded-xl p-3"
            style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[13px] font-semibold" style={{ color: TONE[m.kind].fg }}>
                {shortDate(m.date)}
              </span>
              {kindLabel(m)}
            </div>

            {showDistributor && (
              <p className="text-[13px] mt-0.5 leading-tight">{nameCell(m)}</p>
            )}

            <div
              className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2"
              style={{ borderTop: `1px solid ${C.line}` }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                  Large
                </p>
                <div className="mt-0.5">
                  <SaleSizeCell record={m} size="LARGE" noun={noun(m)} dense />
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                  Small
                </p>
                <div className="mt-0.5">
                  <SaleSizeCell record={m} size="SMALL" noun={noun(m)} dense />
                </div>
              </div>
            </div>

            <div
              className="mt-2 flex items-center justify-between gap-2 pt-2"
              style={{ borderTop: `1px solid ${C.line}` }}
            >
              <span className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                {m.kind === "ISSUE" ? "Stock value" : "Returned bottle value"}
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ fontFamily: FONT_MONO, color: TONE[m.kind].fg }}
              >
                {money(m.amount)}
              </span>
            </div>
          </div>
        ))}

        {footer && movements.length > 0 && (
          <div
            className="rounded-xl p-3 flex items-center justify-between gap-2"
            style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
          >
            <span className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
              {footer.label}
            </span>
            <span
              className="text-[13px] font-semibold"
              style={{ fontFamily: FONT_MONO, color: C.ink900 }}
            >
              {footer.value}
            </span>
          </div>
        )}
      </div>

      {/* desktop: full table */}
      <div
        className={`${show} rounded-2xl`}
        style={{ background: C.card, border: `1px solid ${C.line}` }}
      >
        {/* the scroller stays: the breakdown panel is positioned against the
            viewport, so it is not clipped by an ancestor that scrolls */}
        <div className="overflow-x-auto scroll-touch">
          <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
            <thead>
              <tr style={{ color: C.ink400 }}>
                {headers.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="text-left font-medium px-5 py-2.5 text-xs uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 && (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-5 py-8 text-center text-sm"
                    style={{ color: C.ink400 }}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {movements.map((m) => (
                <tr key={m.id} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td
                    className="px-5 py-3 whitespace-nowrap align-top font-medium"
                    style={{ color: TONE[m.kind].fg }}
                  >
                    {shortDate(m.date)}
                    <span className="block mt-1">{kindLabel(m)}</span>
                  </td>
                  {showDistributor && (
                    <td className="px-5 py-3 align-top">{nameCell(m)}</td>
                  )}
                  <td className="px-5 py-3 align-top">
                    <SaleSizeCell record={m} size="LARGE" noun={noun(m)} />
                  </td>
                  <td className="px-5 py-3 align-top">
                    <SaleSizeCell record={m} size="SMALL" noun={noun(m)} />
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap align-top">
                    {valueCell(m, "ISSUE")}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap align-top">
                    {valueCell(m, "RETURN")}
                  </td>
                </tr>
              ))}
            </tbody>
            {footer && movements.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: `1px solid ${C.line}` }}>
                  <td
                    colSpan={headers.length - 2}
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: C.ink600 }}
                  >
                    {footer.label}
                  </td>
                  <td
                    colSpan={2}
                    className="px-5 py-3 font-semibold whitespace-nowrap"
                    style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                  >
                    {footer.value}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
