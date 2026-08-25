"use client";

import { useCallback, useSyncExternalStore } from "react";
import { monthToDate } from "./period";
import type { DateRange, LoadState } from "./types";

interface Snapshot {
  range: DateRange | null;
  error: string | null;
}

/**
 * Source of the dashboard's reporting period.
 *
 * `new Date()` is a client-only value: the server and the browser can land on
 * different calendar days, so a period computed during render would hydrate
 * into a mismatch. `useSyncExternalStore` is the sanctioned way to read such a
 * value — it hands React a null server snapshot (which the cards render as a
 * loading skeleton rather than a misleading `0`, spec §33) and swaps in the
 * real period on the client.
 *
 * The data itself is local, so this resolves immediately after hydration. When
 * a real API arrives, `compute` becomes the fetch and every consumer of
 * `useDashboardData` keeps working unchanged.
 */

const SERVER_SNAPSHOT: Snapshot = { range: null, error: null };

let cached: Snapshot | null = null;
const listeners = new Set<() => void>();

function compute(): Snapshot {
  try {
    return { range: monthToDate(), error: null };
  } catch {
    // never surface a raw error to an operator on the floor (spec §35)
    return { range: null, error: "Could not load dashboard data." };
  }
}

/** Must return a stable reference between calls or React re-renders forever. */
function getSnapshot(): Snapshot {
  if (!cached) cached = compute();
  return cached;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function refresh(): void {
  cached = compute();
  for (const listener of listeners) listener();
}

interface DashboardData extends Snapshot {
  state: LoadState;
  retry: () => void;
}

export function useDashboardData(): DashboardData {
  const { range, error } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const retry = useCallback(() => refresh(), []);

  const state: LoadState = error ? "error" : range ? "ready" : "loading";
  return { range, error, state, retry };
}
