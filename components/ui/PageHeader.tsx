import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { ROUTES } from "../../lib/routes";
import { C, FONT_HEAD, FONT_BODY } from "../../lib/theme";
import HexBadge from "./HexBadge";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  /** where the back link goes; defaults to the dashboard */
  backHref?: string;
  backLabel?: string;
  /** primary action or status badge shown opposite the title */
  action?: ReactNode;
  backHome?: boolean;
}

/** Back link, hex badge, title and optional action — the standard page top
 *  shared by every full-page view. */
export default function PageHeader({
  icon,
  title,
  subtitle,
  backHref = ROUTES.dashboard,
  backLabel = "Back to dashboard",
  action,
  backHome = false,
}: PageHeaderProps) {
  return (
    <>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs font-semibold mb-1.5 -ml-2 px-2 py-2 min-h-11 sm:min-h-0 sm:mb-4 transition-colors hover:opacity-70"
        style={{ fontFamily: FONT_BODY, color: C.ink600 }}
      >
        <ArrowLeft size={14} aria-hidden /> {backLabel}
      </Link>
      {backHome && (
        <Link
          href={ROUTES.dashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold mb-1.5 -ml-2 px-2 py-2 min-h-11 sm:min-h-0 sm:mb-4 transition-colors hover:opacity-70"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          <Home size={14} aria-hidden />
          Dashboard
        </Link>
      )}

      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between sm:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <HexBadge icon={icon} className="w-9 h-9 sm:w-[42px] sm:h-[42px]" />
          <div className="min-w-0">
            <h1
              className="text-base sm:text-xl font-semibold leading-tight"
              style={{ fontFamily: FONT_HEAD, color: C.ink900 }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-xs mt-0.5 sm:text-sm"
                style={{ color: C.ink600 }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
    </>
  );
}
