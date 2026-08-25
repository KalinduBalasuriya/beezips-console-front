import type { Metadata } from "next";
import ExpensesPage from "../../../../components/finance/ExpensesPage";

export const metadata: Metadata = { title: "Beezips | Expenses" };

export default function Page() {
  return <ExpensesPage />;
}
