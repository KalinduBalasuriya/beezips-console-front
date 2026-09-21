import Link from "next/link";
import { Users, Receipt } from "lucide-react";
import { DISTRIBUTORS } from "../../data/mockData";
import { distributorSummary } from "../../lib/selectors";
import { ROUTES, distributorSalesRoute } from "../../lib/routes";
import { money, qty as fmtQty, fullDate, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_BODY, FONT_HEAD, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import { EmptyState } from "../ui/States";

interface DistributorProfilePageProps {
  distributorName: string | null;
}

/** Balance presentation, matching the distributors list. */
function balanceTone(balance: number) {
  if (balance < 0) return { bg: C.dangerBg, fg: C.danger, label: `Due ${money(-balance)}` };
  if (balance > 0) return { bg: C.infoBg, fg: C.info, label: `Exceed ${money(balance)}` };
  return { bg: C.successBg, fg: C.success, label: "Settled" };
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

  const summary = distributorSummary(dist.name);
  const tone = balanceTone(dist.balance);

  /* identity first, then the money — the order staff read them in */
  const details = [
    { label: "Distributor ID", value: `#${dist.id}` },
    { label: "Name", value: dist.name },
    { label: "Joined", value: fullDate(dist.joined) },
    {
      label: "Last sale",
      value: summary.lastSale ? fullDate(summary.lastSale) : EMPTY_VALUE,
    },
  ];

  const trading = [
    { label: "Total sales value", value: money(summary.totalAmount), strong: true },
    { label: "Bottles sold", value: fmtQty(summary.bottles) },
    { label: "Large bottles", value: fmtQty(summary.large) },
    { label: "Small bottles", value: fmtQty(summary.small) },
  ];

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Users}
        title={dist.name}
        subtitle={`${summary.salesCount} ${summary.salesCount === 1 ? "sale" : "sales"} so far`}
        backHref={ROUTES.distributors}
        backLabel="Back to distributors"
        action={
          <Link
            href={distributorSalesRoute(dist.name)}
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 min-h-11 text-[13px] sm:text-sm font-semibold w-full sm:w-auto shrink-0 transition-transform active:scale-[0.98]"
            style={{ fontFamily: FONT_BODY, color: C.ink900, background: C.brand }}
          >
            <Receipt size={15} aria-hidden /> View sales
          </Link>
        }
      />

      {/* ---------- current standing ---------- */}
      <div
        className="rounded-xl px-3 py-3 mb-3 flex items-center justify-between gap-3 sm:rounded-2xl sm:px-5 sm:py-4 sm:mb-4"
        style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
      >
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
            Account status
          </p>
          <p className="text-[11px] mt-0.5 sm:text-xs" style={{ color: C.ink600 }}>
            {dist.balance < 0
              ? "This distributor owes us."
              : dist.balance > 0
                ? "This distributor has paid ahead."
                : "Nothing outstanding either way."}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1.5 text-xs font-semibold shrink-0 whitespace-nowrap"
          style={{ background: tone.bg, color: tone.fg }}
        >
          {tone.label}
        </span>
      </div>

      {/* ---------- identity ---------- */}
      <section
        className="rounded-xl p-3 mb-3 sm:rounded-2xl sm:p-5 sm:mb-4"
        style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
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
              <dt className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
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
        style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
        aria-labelledby="distributor-sales-heading"
      >
        <h2
          id="distributor-sales-heading"
          className="text-[13px] font-semibold mb-2 sm:text-sm sm:mb-3"
          style={{ fontFamily: FONT_HEAD, color: C.ink900 }}
        >
          Total sales so far
        </h2>

        {summary.salesCount === 0 ? (
          <p className="text-[13px]" style={{ color: C.ink400 }}>
            No sales recorded for this distributor yet.
          </p>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4">
            {trading.map(({ label, value, strong }) => (
              <div key={label} className="min-w-0">
                <dt className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                  {label}
                </dt>
                <dd
                  className={`mt-0.5 font-semibold ${strong ? "text-[15px] sm:text-lg" : "text-[13px] sm:text-base"}`}
                  style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}
