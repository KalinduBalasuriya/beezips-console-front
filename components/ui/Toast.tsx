import { C, FONT_BODY, hexClip } from "../../lib/theme";

interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 max-w-[calc(100vw-2rem)] rounded-full px-5 py-3 text-sm font-medium flex items-center gap-2 z-50"
      style={{ background: C.ink900, color: "#fff", fontFamily: FONT_BODY }}
    >
      <span style={{ ...hexClip, background: C.brand, width: 8, height: 8 }} />
      {message}
    </div>
  );
}
