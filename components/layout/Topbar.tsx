import { Search, Bell, Menu } from "lucide-react";
import { C, FONT_HEAD } from "../../lib/theme";

interface TopbarProps {
  onOpenMenu: () => void;
}

export default function Topbar({ onOpenMenu }: TopbarProps) {
  return (
    <div
      className="relative overflow-hidden px-3 py-2.5 sm:px-6 sm:py-4 lg:px-8 lg:pt-7 lg:pb-6 flex items-center gap-2.5 sm:gap-3"
      style={{ borderBottom: `1px solid ${C.line}` }}
    >
      <button
        onClick={onOpenMenu}
        className="lg:hidden shrink-0 flex items-center justify-center rounded-lg h-11 w-11 -ml-1 sm:rounded-xl"
        style={{ background: C.card, border: `1px solid ${C.line}` }}
        aria-label="Open menu"
      >
        <Menu size={18} color={C.ink700} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] sm:text-lg lg:text-xl font-semibold truncate leading-tight" style={{ fontFamily: FONT_HEAD, color: C.ink900 }}>
          Good afternoon, Sanduni
        </p>
        <p className="text-[11px] sm:text-sm mt-0.5 lg:mt-1 leading-tight" style={{ color: C.ink600 }}>
          Tuesday, 1 September 2026
          <span className="hidden sm:inline"> · production floor is running Mango and Tamarind batches</span>
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div
          className="hidden lg:flex items-center gap-2 rounded-full px-3.5 py-2"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <Search size={15} color={C.ink400} />
          <input
            placeholder="Search distributors, invoices..."
            className="text-sm outline-none bg-transparent w-47.5"
            style={{ fontFamily: "inherit", color: C.ink900 }}
          />
        </div>
        <button
          className="relative rounded-full flex items-center justify-center h-11 w-11 sm:h-auto sm:w-auto sm:p-2.5"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
          aria-label="Notifications"
        >
          <Bell size={16} color={C.ink600} />
          <span className="absolute top-2 right-2 sm:top-1.5 sm:right-1.5 rounded-full" style={{ width: 6, height: 6, background: C.danger }} />
        </button>
        <div
          className="rounded-full flex items-center justify-center text-xs font-semibold shrink-0 h-8 w-8 sm:h-[38px] sm:w-[38px] sm:text-sm"
          style={{ background: C.brand, color: C.ink900, fontFamily: FONT_HEAD }}
        >
          SP
        </div>
      </div>
    </div>
  );
}
