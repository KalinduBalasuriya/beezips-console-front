"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { C, FONT_BODY } from "../../lib/theme";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PurchaseForm from "../modals/PurchaseForm";
import ProductionForm from "../modals/ProductionForm";
import ExpenseForm from "../modals/ExpenseForm";
import IncomeForm from "../modals/IncomeForm";
import Toast from "../ui/Toast";
import type { ModalType } from "../../lib/types";

interface ModalControls {
  /** opens one of the shared Quick Action forms */
  open: (modal: Exclude<ModalType, null>) => void;
}

const ModalContext = createContext<ModalControls | null>(null);

/**
 * Lets any page open a Quick Action form.
 *
 * The forms live in the shell rather than in each page so that a single
 * instance is shared across routes — the dashboard's quick actions and the
 * "Add purchase" button on Inventory open the very same dialog.
 */
export function useModals(): ModalControls {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals must be used inside AppShell");
  return ctx;
}

/**
 * Persistent application chrome: sidebar, topbar, shared dialogs and toast.
 *
 * This lives in the route-group layout, so navigating between pages swaps only
 * the page body — the sidebar keeps its scroll position and expanded groups
 * rather than remounting on every route change.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [toast, setToast] = useState("");

  const closeModal = useCallback(() => setModal(null), []);
  const save = useCallback((message: string) => {
    setModal(null);
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }, []);

  const controls = useMemo<ModalControls>(() => ({ open: (m) => setModal(m) }), []);

  return (
    <ModalContext.Provider value={controls}>
      <div style={{ background: C.surface, minHeight: "100vh", fontFamily: FONT_BODY }}>
        <div className="flex">
          <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

          <main className="flex-1 min-w-0">
            <Topbar onOpenMenu={() => setMenuOpen(true)} />
            {children}
          </main>
        </div>

        {modal === "purchase" && (
          <PurchaseForm onClose={closeModal} onSaved={() => save("Purchase saved and stock updated")} />
        )}
        {modal === "production" && (
          <ProductionForm onClose={closeModal} onSaved={() => save("Production batch saved")} />
        )}
        {modal === "expense" && (
          <ExpenseForm onClose={closeModal} onSaved={() => save("Expense recorded")} />
        )}
        {modal === "income" && (
          <IncomeForm onClose={closeModal} onSaved={() => save("Payment recorded")} />
        )}

        <Toast message={toast} />
      </div>
    </ModalContext.Provider>
  );
}
