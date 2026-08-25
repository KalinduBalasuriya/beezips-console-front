import type { FocusEvent, InputHTMLAttributes } from "react";
import { C } from "../../lib/theme";
import { inputStyle, inputClass } from "../../lib/formStyles";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function TextInput(props: TextInputProps) {
  return (
    <input
      {...props}
      className={inputClass}
      style={{ ...inputStyle, ...(props.style || {}) }}
      onFocus={(e: FocusEvent<HTMLInputElement>) => (e.target.style.boxShadow = `0 0 0 2px ${C.brand}`)}
      onBlur={(e: FocusEvent<HTMLInputElement>) => (e.target.style.boxShadow = "none")}
    />
  );
}
