import { Wallet, Receipt, TrendingUp } from "lucide-react";
import { money } from "../../lib/format";
import { cashCollected, totalExpenses, profitAndLoss } from "../../lib/selectors";
import { periodLabel } from "../../lib/period";
import { ROUTES } from "../../lib/routes";
import StatCard from "../ui/StatCard";
import BottlesProducedStatCard from "./BottlesProducedStatCard";
import BottlesSoldStatCard from "./BottlesSoldStatCard";
import FinishedStockStatCard from "./FinishedStockStatCard";
import type { DateRange, LoadState } from "../../lib/types";

interface StatCardsRowProps {
  range: DateRange | null;
  state: LoadState;
}

/**
 * The three month-to-date headline figures (spec §6).
 *
 * Every value covers the first of the current month through today, and each
 * "View all" links to the same route its sidebar entry does — no dashboard-only
 * pages (spec §10, §36).
 */
export default function StatCardsRow({ range, state }: StatCardsRowProps) {
  const loading = state !== "ready" || !range;
  const sub = range ? `${periodLabel(range)}, month to date` : undefined;
  const profitable = range ? profitAndLoss(range).net >= 0 : true;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
      {/* The two cards that carry a Large/Small pair sit together: each needs a
          second line in a narrow column, so pairing them keeps either from
          stretching a single-figure card beside it. */}
      <BottlesProducedStatCard range={range} state={state} sub={sub} />
      <BottlesSoldStatCard range={range} state={state} sub={sub} />
      <FinishedStockStatCard state={state} sub={sub} />
      <StatCard
        icon={Wallet}
        label="Cash collected"
        value={range ? money(cashCollected(range)) : null}
        loading={loading}
        sub={sub}
        viewAllHref={ROUTES.financeIncome}
        viewAllLabel="View all income"
      />
      <StatCard
        icon={Receipt}
        label="Expenses"
        value={range ? money(totalExpenses(range)) : null}
        loading={loading}
        sub={sub}
        viewAllHref={ROUTES.financeExpenses}
        viewAllLabel="View all expenses"
      />

      {/* No card carries a span, so every one occupies a single column and they
          all render at the same width. */}
      <StatCard
        icon={TrendingUp}
        label="Profit / loss"
        value={range ? money(profitAndLoss(range).net) : null}
        loading={loading}
        /* the pill names the outcome, so the meaning is not carried by colour
           alone, and unlike `sub` it stays visible on a phone */
        trend={profitable ? "Profit" : "Loss"}
        trendUp={profitable}
        sub={sub}
        viewAllHref={ROUTES.financeProfitLoss}
        viewAllLabel="View profit and loss"
      />
    </div>
  );
}
