/**
 * Every route in the app, in one place.
 *
 * Components link to `ROUTES.*` rather than to literal strings so a path is
 * defined once and the compiler catches a rename everywhere it is used.
 */
export const ROUTES = {
  dashboard: "/dashboard",
  purchasing: "/purchasing",
  production: "/production",
  sales: "/sales-and-distribution",
  inventory: "/inventory",
  distributors: "/distributors",
  financeExpenses: "/finance/expenses",
  financeIncome: "/finance/income",
  financeProfitLoss: "/finance/profit-loss",
  reports: "/reports",
} as const;

/** Detail route for one distributor's sales history. */
export function distributorRoute(name: string): string {
  return `${ROUTES.distributors}/${encodeURIComponent(name)}`;
}

/** True when `pathname` is `href` or one of its nested routes. */
export function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
