import { Factory, Wallet, Receipt } from "lucide-react";
import { money, qty } from "../../lib/format";
import { bottlesProduced, cashCollected, totalExpenses } from "../../lib/selectors";
import { periodLabel } from "../../lib/period";
import { ROUTES } from "../../lib/routes";
import StatCard from "../ui/StatCard";
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
      <StatCard
        icon={Factory}
        label="Bottles produced"
        value={range ? qty(bottlesProduced(range)) : null}
        loading={loading}
        sub={sub}
        viewAllHref={ROUTES.production}
        viewAllLabel="View all bottles produced"
      />
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
        /* the third card fills the row on mobile, where the grid is 2-up */
        className="col-span-2 lg:col-span-1"
      />
    </div>
  );
}
