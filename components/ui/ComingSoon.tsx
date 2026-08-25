import type { LucideIcon } from "lucide-react";
import PageHeader from "./PageHeader";
import { C, FONT_BODY } from "../../lib/theme";

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Placeholder for a sidebar section that has a route but no module yet.
 *
 * These sections are reachable so navigation behaves consistently everywhere,
 * and the page says plainly that it isn't built rather than showing an empty
 * shell that reads like a bug.
 */
export default function ComingSoon({ icon, title, description }: ComingSoonProps) {
  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader icon={icon} title={title} subtitle="Not built yet" />
      <div
        className="rounded-xl p-4 sm:rounded-2xl sm:p-6"
        style={{ background: C.card, border: `1px solid ${C.line}` }}
      >
        <p className="text-[13px] sm:text-sm max-w-prose" style={{ fontFamily: FONT_BODY, color: C.ink600 }}>
          {description}
        </p>
      </div>
    </div>
  );
}
