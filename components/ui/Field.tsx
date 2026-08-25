import type { ReactNode } from "react";
import { C, FONT_BODY } from "../../lib/theme";

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export default function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="block mb-3 sm:mb-4">
      <span
        className="block text-[11px] font-medium mb-1 sm:text-xs sm:mb-1.5"
        style={{ color: C.ink600, fontFamily: FONT_BODY }}
      >
        {label}
      </span>
      {children}
      {hint && (
        <span
          className="block text-[11px] mt-1 sm:text-xs"
          style={{ color: C.ink400, fontFamily: FONT_BODY }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}
