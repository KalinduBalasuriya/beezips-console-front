import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import HexBadge from "./HexBadge";
import { Skeleton } from "./States";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  /** null while loading — the card shows a skeleton rather than a stand-in 0 */
  value: string | null;
  loading?: boolean;
  trend?: string;
  trendUp?: boolean;
  sub?: string;
  /** route the "View all" control links to */
  viewAllHref?: string;
  /** accessible name for it, which needs to say where it goes */
  viewAllLabel?: string;
  className?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  loading = false,
  trend,
  trendUp,
  sub,
  viewAllHref,
  viewAllLabel,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-3 sm:rounded-2xl sm:p-5 ${className}`}
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <HexBadge icon={icon} className="w-8 h-8 sm:w-10 sm:h-10" />
        {trend && !loading && (
          <div
            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:gap-1 sm:px-2 sm:py-1 sm:text-xs"
            style={{
              background: trendUp ? C.successBg : C.dangerBg,
              color: trendUp ? C.success : C.danger,
              fontFamily: FONT_BODY,
            }}
          >
            {trendUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {trend}
          </div>
        )}
      </div>

      <p
        className="text-[10px] font-medium uppercase tracking-wide mt-2 leading-tight sm:text-xs sm:mt-4"
        style={{ fontFamily: FONT_BODY, color: C.ink600 }}
      >
        {label}
      </p>

      {loading || value === null ? (
        <Skeleton className="h-6 w-24 mt-1 sm:h-8 sm:w-32" />
      ) : (
        <p
          className="text-lg font-semibold mt-0.5 sm:text-2xl sm:mt-1"
          style={{ fontFamily: FONT_MONO, color: C.ink900 }}
        >
          {value}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-0.5 sm:mt-1">
        {/* the sub-line is secondary detail — it costs a row of height on a
            phone, so it only appears once there's room for it */}
        {sub && (
          <p className="hidden sm:block text-xs" style={{ fontFamily: FONT_BODY, color: C.ink400 }}>
            {sub}
          </p>
        )}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            aria-label={viewAllLabel}
            className="text-[11px] font-semibold shrink-0 ml-auto -mr-2 -my-2 px-2 py-2 sm:text-xs sm:py-1 sm:-my-1"
            style={{ color: C.brandInk, fontFamily: FONT_BODY }}
          >
            View all
          </Link>
        )}
      </div>
    </div>
  );
}
