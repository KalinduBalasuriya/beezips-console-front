import type { Metadata } from "next";
import ProfitLossPage from "../../../../components/finance/ProfitLossPage";

export const metadata: Metadata = { title: "Beezips | Profit & Loss" };

export default function Page() {
  return <ProfitLossPage />;
}
