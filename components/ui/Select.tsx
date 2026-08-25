import type { FocusEvent, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { C } from "../../lib/theme";
import { inputStyle, inputClass } from "../../lib/formStyles";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select(props: SelectProps) {
  return (
    <div className="relative">
      <select
        {...props}
        className={inputClass + " appearance-none pr-9"}
        style={{ ...inputStyle, ...(props.style || {}) }}
        onFocus={(e: FocusEvent<HTMLSelectElement>) => (e.target.style.boxShadow = `0 0 0 2px ${C.brand}`)}
        onBlur={(e: FocusEvent<HTMLSelectElement>) => (e.target.style.boxShadow = "none")}
      >
        {props.children}
      </select>
      <ChevronDown size={15} color={C.ink400} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
