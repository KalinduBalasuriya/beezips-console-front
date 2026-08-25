"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Droplets, X, ChevronDown } from "lucide-react";
import { NAV } from "../../data/mockData";
import { isRouteActive } from "../../lib/routes";
import { C, FONT_HEAD, FONT_BODY, hexClip } from "../../lib/theme";
import type { NavItem } from "../../lib/types";

interface SidebarProps {
  /** drawer state — only meaningful below `lg`, where the sidebar is off-canvas */
  open: boolean;
  onClose: () => void;
}

/** True when this item, or any of its children, matches the current URL. */
function isActive(item: NavItem, pathname: string): boolean {
  if (item.href && isRouteActive(pathname, item.href)) return true;
  return (item.children ?? []).some((child) => child.href && isRouteActive(pathname, child.href));
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  /* Expansion is derived from the URL, not stored: a group is open whenever it
     owns the current route, so landing on /finance/income from a dashboard
     "View all" opens Finance without an effect. `overrides` records an explicit
     user toggle, which wins until they toggle it back. */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const isExpanded = (item: NavItem) => overrides[item.label] ?? isActive(item, pathname);

  /* close the drawer on Escape, and stop the page behind it from scrolling
     while it's open */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const toggle = (item: NavItem) => {
    const next = !isExpanded(item);
    setOverrides((prev) => ({ ...prev, [item.label]: next }));
  };

  const itemStyle = (active: boolean) => ({
    fontFamily: FONT_BODY,
    fontWeight: active ? 600 : 500,
    background: active ? C.brand : "transparent",
    color: active ? C.ink900 : C.ink400,
  });

  const rowClass =
    "w-full flex items-center gap-3 px-3 py-3 min-h-11 rounded-xl text-sm transition-colors lg:py-2.5 lg:min-h-0";

  return (
    <>
      {/* scrim — mobile/tablet only */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(28,27,23,0.45)" }}
      />

      <aside
        aria-label="Main navigation"
        className={`
          fixed inset-y-0 left-0 z-50 w-68 max-w-[85vw] flex flex-col
          transform transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:z-auto lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-none
        `}
        style={{ background: C.ink900, minHeight: "100vh" }}
      >
        <div className="flex items-center gap-3 px-5 pt-6 pb-5 sm:px-6 sm:pt-7 sm:pb-6">
          <div
            style={{ ...hexClip, background: C.brand, width: 38, height: 38 }}
            className="flex items-center justify-center shrink-0"
          >
            <Droplets size={18} color={C.ink900} strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold leading-none" style={{ fontFamily: FONT_HEAD, color: "#fff" }}>
              Beezips
            </p>
            <p className="text-xs mt-1" style={{ color: C.ink400 }}>
              RTS beverage ops
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden shrink-0 flex items-center justify-center rounded-lg -mr-2 h-11 w-11"
            aria-label="Close menu"
          >
            <X size={20} color={C.ink400} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {NAV.map((item) => {
            const active = isActive(item, pathname);

            if (item.children) {
              const isOpen = isExpanded(item);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggle(item)}
                    aria-expanded={isOpen}
                    className={rowClass}
                    /* the parent shows a subtle tint — the exact child route
                       keeps the solid brand pill */
                    style={{
                      ...itemStyle(false),
                      background: active && !isOpen ? "rgba(255,205,52,0.16)" : "transparent",
                      color: active ? "#fff" : C.ink400,
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    <item.icon size={17} className="shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      size={15}
                      className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-1 space-y-1 pl-4">
                      {item.children.map((child) => {
                        const childActive = !!child.href && isRouteActive(pathname, child.href);
                        return (
                          <Link
                            key={child.label}
                            href={child.href ?? "#"}
                            onClick={onClose}
                            aria-current={childActive ? "page" : undefined}
                            className={rowClass}
                            style={itemStyle(childActive)}
                          >
                            <child.icon size={16} className="shrink-0" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={rowClass}
                style={itemStyle(active)}
              >
                <item.icon size={17} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 safe-b">
          <button className={`${rowClass} font-medium`} style={{ fontFamily: FONT_BODY, color: C.ink400 }}>
            <Settings size={17} className="shrink-0" />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}
