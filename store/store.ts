import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./api/baseApi";

/**
 * Creates a Redux store.
 *
 * A factory rather than a module-level singleton, as the Redux guide for the
 * Next.js App Router requires: the server may render several requests in one
 * process, and a shared store would leak one user's state into another's page.
 * StoreProvider calls this once per browser session.
 */
export function makeStore() {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

  /* refetch on window focus / reconnect for queries that opt in */
  setupListeners(store.dispatch);
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
