import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";
import ComingSoon from "../../../components/ui/ComingSoon";

export const metadata: Metadata = { title: "Beezips | Purchasing" };

export default function Page() {
  return (
    <ComingSoon
      icon={ShoppingCart}
      title="Purchasing"
      description="The purchasing register is not built yet. Raw-material purchases can still be logged with Add purchase, and current stock is on the Inventory page."
    />
  );
}
