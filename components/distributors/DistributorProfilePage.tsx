import Link from "next/link";
import { Users, Receipt } from "lucide-react";
import { DISTRIBUTORS } from "../../data/mockData";
import { distributorTrade } from "../../lib/selectors";
import { ROUTES, distributorSalesRoute } from "../../lib/routes";
import { money, qty as fmtQty, fullDate, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_BODY, FONT_HEAD, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import BalancePill from "../ui/BalancePill";
import { EmptyState } from "../ui/States";
import HoverBreakdown, { type BreakdownRow } from "../ui/HoverBreakdown";
import type { FlavorBottles } from "../../lib/selectors";

interface DistributorProfilePageProps {
  distributorName: string | null;
}

/**
 * One distributor's account: who they are, what they owe, and what they have
 * bought in total.
 *
 * The sales history is a page of its own behind "View sales" rather than the
 * landing view — this page answers "who is this account and where does it
 * stand", which a transaction table buries.
 */
export default function DistributorProfilePage({
  distributorName,
}: DistributorProfilePageProps) {
  const dist = DISTRIBUTORS.find((d) => d.name === distributorName);

  if (!dist) {
    return (
      <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
        <PageHeader
          icon={Users}
          title={distributorName ?? "Distributor"}
          backHref={ROUTES.distributors}
          backLabel="Back to distributors"
        />
        <EmptyState message="No such distributor." />
      </div>
    );
  }

  const trade = distributorTrade(dist.name);

  /* identity first, then the money — the order staff read them in */
  const details = [
    { label: "Distributor ID", value: `#${dist.id}` },
    { label: "Name", value: dist.name },
    { label: "Joined", value: fullDate(dist.joined) },
    {
      label: "Last activity",
      value: trade.lastActivity ? fullDate(trade.lastActivity) : EMPTY_VALUE,
    },
  ];

  /**
   * A bottle count at one size, opened up by flavor on hover or tap.
   *
   * No size is ever added to the other: large and small are different goods at
   * different prices, so a combined bottle count would answer nothing.
   */
  const bottleFigure = (
    quantity: number,
    size: "large" | "small",
    flavors: FlavorBottles[],
    heading: string,
    ariaSubject: string,
  ) => {
    if (quantity === 0) {
      return (
        <span style={{ fontFamily: FONT_MONO, color: C.ink400 }}>{EMPTY_VALUE}</span>
      );
    }
    const rows: BreakdownRow[] = flavors
      .filter((f) => f[size] > 0)
      .map((f) => ({ label: f.flavor, value: fmtQty(f[size]) }));
    return (
      <HoverBreakdown
        trigger={<span style={{ fontFamily: FONT_MONO }}>{fmtQty(quantity)}</span>}
        title={heading}
        rows={rows}
        total={fmtQty(quantity)}
        ariaLabel={`${fmtQty(quantity)} ${ariaSubject}. Show breakdown by flavor`}
        triggerClassName="min-h-11 inline-flex items-center"
      />
    );
  };

  const sizeLabel = (size: "large" | "small") => (size === "large" ? "Large" : "Small");

  /* what they actually bought: the two sizes, each net of what came back */
  const trading = (["large", "small"] as const).map((size) => ({
    label: `${sizeLabel(size)} bottles sold`,
    node: bottleFigure(
      trade.net[size],
      size,
      trade.netByFlavor,
      `${sizeLabel(size)} bottles sold by flavor`,
      `${size} bottles sold`,
    ),
  }));

  /* the two sides that net figure is made of, each size on its own */
  const movement = [
    ...(["large", "small"] as const).map((size) => ({
      label: `${sizeLabel(size)} issued`,
      node: bottleFigure(
        trade.issued[size],
        size,
        trade.issuedByFlavor,
        `${sizeLabel(size)} bottles issued by flavor`,
        `${size} bottles issued`,
      ),
    })),
    ...(["large", "small"] as const).map((size) => ({
      label: `${sizeLabel(size)} returned`,
      node: bottleFigure(
        trade.returned[size],
        size,
        trade.returnedByFlavor,
        `${sizeLabel(size)} bottles returned by flavor`,
        `${size} bottles returned`,
      ),
    })),
    { label: "Stock value", node: money(trade.issuedAmount) },
    { label: "Returns credited", node: money(trade.returnedAmount) },
    { label: "Payments received", node: money(trade.received) },
  ];

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Users}
        title={dist.name}
        subtitle={`${trade.issues} ${trade.issues === 1 ? "issue" : "issues"}${trade.returnVisits > 0 ? ` · ${trade.returnVisits} ${trade.returnVisits === 1 ? "return" : "returns"}` : ""}`}
        backHref={ROUTES.distributors}
        backLabel="Back to distributors"
        backHome={true}
        action={
          <Link
            href={distributorSalesRoute(dist.name)}
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 min-h-11 text-[13px] sm:text-sm font-semibold w-full sm:w-auto shrink-0 transition-transform active:scale-[0.98]"
            style={{
              fontFamily: FONT_BODY,
              color: C.ink900,
              background: C.brand,
            }}
          >
            <Receipt size={15} aria-hidden /> View sales
          </Link>
        }
      />

      {/* ---------- current standing ---------- */}
      <div
        className="rounded-xl px-3 py-3 mb-3 flex items-center justify-between gap-3 sm:rounded-2xl sm:px-5 sm:py-4 sm:mb-4"
        style={{
          background: C.card,
          border: `1px solid ${C.line}`,
          fontFamily: FONT_BODY,
        }}
      >
        <div className="min-w-0">
          <p
            className="text-[10px] uppercase tracking-wide"
            style={{ color: C.ink400 }}
          >
            Account status
          </p>
          <p
            className="text-[11px] mt-0.5 sm:text-xs"
            style={{ color: C.ink600 }}
          >
            {trade.balance < 0
              ? "This distributor owes us."
              : trade.balance > 0
                ? "This distributor has paid ahead."
                : "Nothing outstanding either way."}
          </p>
        </div>
        <BalancePill balance={trade.balance} className="px-3 py-1.5 text-xs" />
      </div>

      {/* ---------- identity ---------- */}
      <section
        className="rounded-xl p-3 mb-3 sm:rounded-2xl sm:p-5 sm:mb-4"
        style={{
          background: C.card,
          border: `1px solid ${C.line}`,
          fontFamily: FONT_BODY,
        }}
        aria-labelledby="distributor-details-heading"
      >
        <h2
          id="distributor-details-heading"
          className="text-[13px] font-semibold mb-2 sm:text-sm sm:mb-3"
          style={{ fontFamily: FONT_HEAD, color: C.ink900 }}
        >
          Details
        </h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4">
          {details.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt
                className="text-[10px] uppercase tracking-wide"
                style={{ color: C.ink400 }}
              >
                {label}
              </dt>
              <dd
                className="text-[13px] font-medium mt-0.5 break-words sm:text-sm"
                style={{ color: C.ink900 }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- lifetime trading ---------- */}
      <section
        className="rounded-xl p-3 sm:rounded-2xl sm:p-5"
        style={{
          background: C.card,
          border: `1px solid ${C.line}`,
          fontFamily: FONT_BODY,
        }}
        aria-labelledby="distributor-sales-heading"
      >
        <h2
          id="distributor-sales-heading"
          className="text-[13px] font-semibold mb-2 sm:text-sm sm:mb-3"
          style={{ fontFamily: FONT_HEAD, color: C.ink900 }}
        >
          Total sales so far, net of returns
        </h2>

        {trade.issues === 0 ? (
          <p className="text-[13px]" style={{ color: C.ink400 }}>
            No sales recorded for this distributor yet.
          </p>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4">
            <div className="min-w-0">
              <dt
                className="text-[10px] uppercase tracking-wide"
                style={{ color: C.ink400 }}
              >
                Net sales value
              </dt>
              <dd
                className="mt-0.5 font-semibold text-[15px] sm:text-lg"
                style={{ fontFamily: FONT_MONO, color: C.ink900 }}
              >
                {money(trade.netAmount)}
              </dd>
            </div>
            {trading.map(({ label, node }) => (
              <div key={label} className="min-w-0">
                <dt
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: C.ink400 }}
                >
                  {label}
                </dt>
                <dd
                  className="mt-0.5 font-semibold text-[13px] sm:text-base"
                  style={{ color: C.ink900 }}
                >
                  {node}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {trade.issues > 0 && (
          <dl
            className="grid grid-cols-2 gap-x-4 gap-y-3 mt-3 pt-3 lg:grid-cols-4"
            style={{ borderTop: `1px solid ${C.line}` }}
          >
            {movement.map(({ label, node }) => (
              <div key={label} className="min-w-0">
                <dt
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: C.ink400 }}
                >
                  {label}
                </dt>
                <dd
                  className="text-[13px] font-medium mt-0.5"
                  style={{ fontFamily: FONT_MONO, color: C.ink600 }}
                >
                  {node}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}
