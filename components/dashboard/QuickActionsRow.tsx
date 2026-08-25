"use client";

import { ShoppingCart, Factory, Receipt, HandCoins } from "lucide-react";
import { C, FONT_BODY } from "../../lib/theme";
import { useModals } from "../layout/AppShell";
import QuickAction from "../ui/QuickAction";

export default function QuickActionsRow() {
  const { open } = useModals();

  return (
    <>
      <p
        className="text-[11px] font-semibold uppercase tracking-wide mb-2 sm:text-xs sm:mb-3"
        style={{ fontFamily: FONT_BODY, color: C.ink600 }}
      >
        Quick actions
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
        <QuickAction icon={ShoppingCart} label="Add purchase" sub="Log raw material stock" onClick={() => open("purchase")} />
        <QuickAction icon={Factory} label="Add production" sub="Log a production batch" onClick={() => open("production")} />
        <QuickAction icon={Receipt} label="Add expense" sub="Log an operating cost" onClick={() => open("expense")} />
        <QuickAction icon={HandCoins} label="Add income" sub="Record distributor payment" onClick={() => open("income")} />
      </div>
    </>
  );
}
