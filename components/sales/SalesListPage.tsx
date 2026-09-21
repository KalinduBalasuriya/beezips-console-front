"use client";

import { useMemo, useState } from "react";
import { Search, Truck } from "lucide-react";
import { sortedSales } from "../../lib/selectors";
import { C, FONT_BODY } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import Pagination from "../ui/Pagination";
import SalesTable from "./SalesTable";

/** records per page on the full Sales & Distribution list */
const PAGE_SIZE = 6;

export default function SalesListPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () => sortedSales().filter((s) => s.distributor.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  /* a filter change can leave the user past the last page — clamp on read so
     the list never renders blank */
  const current = Math.min(page, pageCount);
  const startIndex = (current - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  const search = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Truck}
        title="Sales & distribution"
        subtitle={`${rows.length} ${rows.length === 1 ? "record" : "records"} logged`}
        action={
          <div
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 min-h-11 w-full sm:w-auto shrink-0"
            style={{ background: C.card, border: `1px solid ${C.line}` }}
          >
            <Search size={15} color={C.ink400} className="shrink-0" aria-hidden />
            <input
              placeholder="Search distributors..."
              aria-label="Search sales by distributor"
              value={query}
              onChange={(e) => search(e.target.value)}
              className="text-base sm:text-sm outline-none bg-transparent w-full sm:w-47.5 min-w-0"
              style={{ fontFamily: FONT_BODY, color: C.ink900 }}
            />
          </div>
        }
      />

      <SalesTable
        sales={pageRows}
        showStatus
        emptyMessage={query ? "No sales match your search." : "No sales or distribution records yet."}
      />

      <Pagination
        page={current}
        pageCount={pageCount}
        onPageChange={setPage}
        from={rows.length === 0 ? 0 : startIndex + 1}
        to={Math.min(startIndex + PAGE_SIZE, rows.length)}
        total={rows.length}
        noun="sales"
      />
    </div>
  );
}
