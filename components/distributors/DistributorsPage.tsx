import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { DISTRIBUTORS, SALES } from "../../data/mockData";
import { saleTotals } from "../../lib/salesUtils";
import { distributorRoute } from "../../lib/routes";
import { money } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import { EmptyState } from "../ui/States";

/** Balance presentation shared by the card and table layouts. */
function balanceTone(balance: number) {
  if (balance < 0) return { bg: C.dangerBg, fg: C.danger, label: `Due ${money(-balance)}` };
  if (balance > 0) return { bg: C.infoBg, fg: C.info, label: `Exceed ${money(balance)}` };
  return { bg: C.successBg, fg: C.success, label: "Settled" };
}

export default function DistributorsPage() {
  const rows = DISTRIBUTORS.map((d) => {
    const sales = SALES.filter((s) => s.distributor === d.name);
    return {
      ...d,
      salesCount: sales.length,
      totalValue: sales.reduce((sum, s) => sum + saleTotals(s).totalAmt, 0),
    };
  });

  const owing = rows.filter((r) => r.balance < 0).length;

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Users}
        title="Distributors"
        subtitle={`${rows.length} distributors · ${owing} with an outstanding balance`}
      />

      {rows.length === 0 ? (
        <EmptyState message="No distributors yet." />
      ) : (
        <>
          {/* mobile / tablet: one card per distributor */}
          <div className="md:hidden space-y-2.5">
            {rows.map((d) => {
              const tone = balanceTone(d.balance);
              return (
                <Link
                  key={d.id}
                  href={distributorRoute(d.name)}
                  className="block rounded-xl p-3"
                  style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-semibold leading-tight" style={{ color: C.brandInk }}>
                      {d.name}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold shrink-0 whitespace-nowrap"
                      style={{ background: tone.bg, color: tone.fg }}
                    >
                      {tone.label}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 flex items-center justify-between gap-2" style={{ borderTop: `1px solid ${C.line}` }}>
                    <span className="text-[11px]" style={{ color: C.ink400 }}>
                      {d.salesCount} {d.salesCount === 1 ? "sale" : "sales"}
                    </span>
                    <span className="text-[13px] font-semibold" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                      {money(d.totalValue)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* desktop: table */}
          <div className="hidden md:block rounded-2xl" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="overflow-x-auto scroll-touch">
              <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
                <thead>
                  <tr style={{ color: C.ink400 }}>
                    {["Distributor", "Sales", "Total value", "Balance", ""].map((h, i) => (
                      <th
                        key={h || i}
                        scope="col"
                        className={`font-medium px-5 py-2.5 text-xs uppercase tracking-wide whitespace-nowrap ${
                          h === "Total value" ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => {
                    const tone = balanceTone(d.balance);
                    return (
                      <tr key={d.id} style={{ borderTop: `1px solid ${C.line}` }}>
                        <td className="px-5 py-3">
                          <Link
                            href={distributorRoute(d.name)}
                            className="font-medium hover:underline"
                            style={{ color: C.brandInk }}
                          >
                            {d.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                          {d.salesCount}
                        </td>
                        <td
                          className="px-5 py-3 text-right font-medium whitespace-nowrap"
                          style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                        >
                          {money(d.totalValue)}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
                            style={{ background: tone.bg, color: tone.fg }}
                          >
                            {tone.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={distributorRoute(d.name)}
                            aria-label={`View ${d.name}`}
                            className="inline-flex items-center justify-center rounded-lg h-8 w-8"
                            style={{ border: `1px solid ${C.line}` }}
                          >
                            <ChevronRight size={15} color={C.ink600} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
