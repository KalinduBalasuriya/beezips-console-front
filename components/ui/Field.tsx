import type { ReactNode } from "react";
import { C, FONT_BODY } from "../../lib/theme";

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  /** validation message; replaces the hint while present */
  error?: string;
}

export default function Field({ label, children, hint, error }: FieldProps) {
  return (
    <label className="block mb-3 sm:mb-4">
      <span
        className="block text-[11px] font-medium mb-1 sm:text-xs sm:mb-1.5"
        style={{ color: C.ink600, fontFamily: FONT_BODY }}
      >
        {label}
      </span>
      {children}
      {/* the error takes the hint's place rather than stacking under it, so a
          field never grows by two lines at once */}
      {error ? (
        <span
          className="block text-[11px] mt-1 sm:text-xs"
          style={{ color: C.danger, fontFamily: FONT_BODY }}
        >
          {error}
        </span>
      ) : (
        hint && (
          <span
            className="block text-[11px] mt-1 sm:text-xs"
            style={{ color: C.ink400, fontFamily: FONT_BODY }}
          >
            {hint}
          </span>
        )
      )}
    </label>
  );
}
