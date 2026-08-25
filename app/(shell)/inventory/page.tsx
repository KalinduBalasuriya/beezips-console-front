import type { Metadata } from "next";
import InventoryPage from "../../../components/inventory/RawMaterialsPage";

export const metadata: Metadata = { title: "Beezips | Inventory" };

export default function Page() {
  return <InventoryPage />;
}
