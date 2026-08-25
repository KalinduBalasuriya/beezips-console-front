import type { Metadata } from "next";
import ProductionLogPage from "../../../components/production/ProductionLogPage";

export const metadata: Metadata = { title: "Beezips | Production" };

export default function Page() {
  return <ProductionLogPage />;
}
