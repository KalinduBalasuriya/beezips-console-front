"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "../../store/store";

/**
 * Supplies the Redux store to the client tree.
 *
 * The lazy state initialiser creates the store exactly once per mounted
 * provider, so each browser session — and each server render — gets its own
 * store rather than sharing a module-level one.
 */
export default function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  return <Provider store={store}>{children}</Provider>;
}
