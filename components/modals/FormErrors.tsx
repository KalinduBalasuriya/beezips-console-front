import { AlertTriangle } from "lucide-react";
import { C, FONT_BODY } from "../../lib/theme";

interface FormErrorsProps {
  /** issues that belong to the form as a whole, not to one input */
  messages: string[];
  title?: string;
}

/** Panel for whole-form problems — a stock shortage, say, which no single
 *  input is responsible for. Renders nothing when there is nothing to say. */
export default function FormErrors({ messages, title = "This cannot be saved" }: FormErrorsProps) {
  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-lg px-3 py-2.5 mb-3 sm:px-4 sm:py-3 sm:mb-4"
      style={{ background: C.dangerBg, border: `1px solid ${C.line}` }}
    >
      <p
        className="flex items-center gap-1.5 text-[11px] font-semibold mb-1 sm:text-xs"
        style={{ fontFamily: FONT_BODY, color: C.danger }}
      >
        <AlertTriangle size={13} aria-hidden /> {title}
      </p>
      <ul className="space-y-0.5">
        {messages.map((m) => (
          <li key={m} className="text-[11px]" style={{ fontFamily: FONT_BODY, color: C.danger }}>
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
