import { ChevronLeft, ChevronRight } from "lucide-react";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** index range currently shown, for the "x–y of z" summary */
  from: number;
  to: number;
  total: number;
  /** what is being paged, e.g. "records" */
  noun?: string;
}

/** Page navigation for long record lists. */
export default function Pagination({
  page,
  pageCount,
  onPageChange,
  from,
  to,
  total,
  noun = "records",
}: PaginationProps) {
  if (pageCount <= 1) return null;

  /* keep the control compact on a phone: a window of pages around the current
     one rather than every page number */
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(pageCount, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const arrowStyle = (disabled: boolean) => ({
    background: C.card,
    border: `1px solid ${C.line}`,
    opacity: disabled ? 0.4 : 1,
  });

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-2.5 mt-3 sm:flex-row sm:items-center sm:justify-between sm:mt-4"
    >
      <p className="text-[11px] sm:text-xs" style={{ fontFamily: FONT_BODY, color: C.ink600 }}>
        Showing{" "}
        <span style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
          {from}–{to}
        </span>{" "}
        of <span style={{ fontFamily: FONT_MONO, color: C.ink900 }}>{total}</span> {noun}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="flex items-center justify-center rounded-lg h-9 w-9 shrink-0"
          style={arrowStyle(page === 1)}
        >
          <ChevronLeft size={16} color={C.ink700} />
        </button>

        {pages.map((p) => {
          const active = p === page;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={active ? "page" : undefined}
              className="flex items-center justify-center rounded-lg h-9 min-w-9 px-2 text-xs font-semibold"
              style={{
                fontFamily: FONT_BODY,
                background: active ? C.brand : C.card,
                color: active ? C.ink900 : C.ink600,
                border: `1px solid ${active ? C.brand : C.line}`,
              }}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pageCount}
          aria-label="Next page"
          className="flex items-center justify-center rounded-lg h-9 w-9 shrink-0"
          style={arrowStyle(page === pageCount)}
        >
          <ChevronRight size={16} color={C.ink700} />
        </button>
      </div>
    </nav>
  );
}
