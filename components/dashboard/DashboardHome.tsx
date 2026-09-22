"use client";

import StatCardsRow from "./StatCardsRow";
import QuickActionsRow from "./QuickActionsRow";
import StockSnapshotCard from "../inventory/StockSnapshotCard";
import { ErrorState } from "../ui/States";
import { useDashboardData } from "../../lib/useDashboardData";

export default function DashboardHome() {
  const { range, state, error, retry } = useDashboardData();

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      {/* the visible page title is the Topbar greeting; every view still needs
          exactly one h1 for screen readers (spec §31) */}
      <h1 className="sr-only">Dashboard</h1>

      {state === "error" ? (
        <ErrorState message={error ?? "Could not load dashboard data."} onRetry={retry} />
      ) : (
        <>
          <StatCardsRow range={range} state={state} />
          <QuickActionsRow />

          <StockSnapshotCard state={state} />
        </>
      )}
    </div>
  );
}
