import type { Metadata } from "next";
import SalesListPage from "../../../components/sales/SalesListPage";

export const metadata: Metadata = { title: "Beezips | Sales & distribution" };

export default function Page() {
  return <SalesListPage />;
}
