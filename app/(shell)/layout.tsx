import type { ReactNode } from "react";
import AppShell from "../../components/layout/AppShell";

/**
 * Layout for every signed-in page. Because it sits above all of them, the
 * sidebar and topbar persist across navigations instead of remounting.
 */
export default function ShellLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
