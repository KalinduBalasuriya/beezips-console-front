"use client";

import Link from "next/link";
import { recentMovements } from "../../lib/selectors";
import { ROUTES } from "../../lib/routes";
import { C, FONT_HEAD, FONT_BODY } from "../../lib/theme";
import { Skeleton } from "../ui/States";
import BottleMovementsTable from "../sales/BottleMovementsTable";
import type { LoadState } from "../../lib/types";

/** how many movements the dashboard shows */
const RECENT_LIMIT = 6;

/**
 * The latest bottles to move, in either direction, across every distributor.
 *
 * The same ledger a distributor's own page carries, unfiltered: six records
 * might be four issues and two returns rather than six sales, because stock
 * going out and unsold bottles coming back are movements of the same kind.
 */
export default function RecentMovementsCard({ state }: { state: LoadState }) {
  const rows = recentMovements(RECENT_LIMIT);

  return (
    <section aria-labelledby="recent-movements-heading">
      <div className="flex items-center justify-between gap-3 mb-2 lg:mb-3">
        <h3
          id="recent-movements-heading"
          className="text-[13px] font-semibold sm:text-sm"
          style={{ fontFamily: FONT_HEAD, color: C.ink900 }}
        >
          Recent bottle movements
        </h3>
        <Link
          href={ROUTES.sales}
          aria-label="View sales and distribution"
          className="text-[11px] font-semibold shrink-0 -mr-2 -my-2 px-2 py-2 sm:text-xs sm:-my-1"
          style={{ color: C.brandInk, fontFamily: FONT_BODY }}
        >
          View all
        </Link>
      </div>

      {state === "loading" ? (
        <div className="space-y-2.5" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <BottleMovementsTable
          movements={rows}
          showDistributor
          cardBreakpoint="lg"
          emptyMessage="No stock has been issued or returned yet."
        />
      )}
    </section>
  );
}
