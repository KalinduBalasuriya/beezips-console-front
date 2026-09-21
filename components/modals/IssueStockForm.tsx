import { useState } from "react";
import { Truck, Plus, Trash2 } from "lucide-react";
import { DISTRIBUTORS, FLAVORS } from "../../data/mockData";
import {
  finishedStockFor,
  hasSize,
  issueTotals,
  rowBottles,
  type IssueRowInput,
} from "../../lib/issue";
import { issueSchema, validate, type FormIssues } from "../../lib/schemas";
import { money, qty as fmtQty } from "../../lib/format";
import { inputStyle, inputClass } from "../../lib/formStyles";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import Modal from "./Modal";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";
import FormErrors from "./FormErrors";
import type { BottleSize } from "../../lib/types";

interface IssueStockFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const emptyRow = (): IssueRowInput => ({
  flavor: FLAVORS[0],
  bottleSize: "LARGE",
  bottles: "",
});

interface SizeOption {
  value: BottleSize;
  /** as it labels a select option or a total, e.g. "Large" */
  label: string;
  /** as it reads mid-sentence, e.g. "large bottle" */
  noun: string;
  /** validation path for this size's rate */
  rateKey: "largePrice" | "smallPrice";
}

const SIZES: SizeOption[] = [
  { value: "LARGE", label: "Large", noun: "large bottle", rateKey: "largePrice" },
  { value: "SMALL", label: "Small", noun: "small bottle", rateKey: "smallPrice" },
];

/**
 * Issue Stock quick action: bottles leaving the store for a distributor.
 *
 * Rows are one flavor at one bottle size, the way Add Production takes them, so
 * an issue can be all large, all small or a mix without the form insisting on
 * both. The rate is per size rather than per flavor — 200 Tamarind and 500
 * Soursop small bottles are 700 bottles at the one small rate — so a rate field
 * appears only for a size the rows actually contain, and the amount is
 * calculated rather than keyed in. This is the sale the Sales & distribution
 * list already shows.
 */
export default function IssueStockForm({ onClose, onSaved }: IssueStockFormProps) {
  const [date, setDate] = useState("2026-09-01");
  const [distributorId, setDistributorId] = useState(DISTRIBUTORS[0].id);
  const [rows, setRows] = useState<IssueRowInput[]>([emptyRow()]);
  const [largePrice, setLargePrice] = useState("");
  const [smallPrice, setSmallPrice] = useState("");
  const [notes, setNotes] = useState("");
  /* problems stay hidden until the first save attempt, so a half-typed row is
     not scolded while the user is still filling it in */
  const [issues, setIssues] = useState<FormIssues | null>(null);

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<IssueRowInput>) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const rateFor = (size: BottleSize) =>
    size === "LARGE"
      ? { value: largePrice, set: setLargePrice }
      : { value: smallPrice, set: setSmallPrice };

  /* one message per row: the first unresolved complaint about any of its
     fields, so a half-filled row shows a single line rather than three */
  const issueFor = (index: number) => {
    const fields = issues?.fields ?? {};
    const key = Object.keys(fields).find(
      (k) => k.startsWith("rows." + index + ".") && fields[k],
    );
    return key ? fields[key] : undefined;
  };

  const totals = issueTotals({ rows, largePrice, smallPrice });
  const totalFor = (size: BottleSize) =>
    size === "LARGE"
      ? { bottles: totals.largeBottles, amount: totals.largeAmount }
      : { bottles: totals.smallBottles, amount: totals.smallAmount };

  /* only the sizes being issued: the rate and the subtotal for a size nobody
     sent would be noise, and the schema does not ask for them either */
  const issuedSizes = SIZES.filter((s) => hasSize(rows, s.value));

  const submit = () => {
    const result = validate(issueSchema, {
      date,
      distributorId,
      rows,
      largePrice,
      smallPrice,
      notes,
    });
    if (!result.ok) {
      setIssues(result.issues);
      return;
    }
    setIssues(null);
    onSaved();
  };

  return (
    <Modal
      title="Issue stock to distributor"
      subtitle="Record bottles issued and the rate they were charged at"
      icon={Truck}
      onClose={onClose}
      submitLabel="Issue stock"
      onSubmit={submit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Date" error={issues?.fields.date}>
          <TextInput
            type="date"
            aria-label="Issue date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Distributor" error={issues?.fields.distributorId}>
          <Select
            aria-label="Distributor"
            value={String(distributorId)}
            onChange={(e) => setDistributorId(Number(e.target.value))}
          >
            {DISTRIBUTORS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* ---------- bottles issued, one row per flavor and size ---------- */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] font-medium sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          Bottles issued
        </span>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 min-h-9 rounded-md transition-colors hover:bg-black/5 sm:text-xs"
          style={{
            fontFamily: FONT_BODY,
            color: C.brandInk,
            border: `1px solid ${C.line}`,
          }}
        >
          <Plus size={13} aria-hidden /> Add flavor
        </button>
      </div>

      <div className="space-y-3 mb-4 sm:mb-5">
        {rows.map((row, i) => {
          const stock = finishedStockFor(row.flavor, row.bottleSize);
          const short = !!stock && rowBottles(row) > stock.qty;
          const error = issueFor(i);
          return (
            <div key={i}>
              {/* on a phone the flavor and size selects share the top line,
                  with the quantity and remove on the line below */}
              <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
                <div className="col-span-2 sm:col-span-1">
                  <Select
                    value={row.flavor}
                    onChange={(e) => updateRow(i, { flavor: e.target.value })}
                    aria-label={`Flavor for row ${i + 1}`}
                  >
                    {FLAVORS.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-1">
                  <Select
                    value={row.bottleSize}
                    onChange={(e) =>
                      updateRow(i, { bottleSize: e.target.value as BottleSize })
                    }
                    aria-label={`Bottle size for row ${i + 1}`}
                  >
                    {SIZES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <TextInput
                    type="number"
                    min="0"
                    placeholder="Bottles"
                    aria-label={`Bottles issued for row ${i + 1}`}
                    value={String(row.bottles)}
                    onChange={(e) => updateRow(i, { bottles: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  className="flex items-center justify-center h-10 w-10 shrink-0 rounded-md transition-colors hover:bg-black/5 disabled:opacity-30 sm:h-9 sm:w-9"
                  aria-label={`Remove row ${i + 1}`}
                >
                  <Trash2 size={15} color={C.danger} />
                </button>
              </div>

              {stock && (
                <p
                  className="text-[11px] mt-1"
                  style={{ fontFamily: FONT_BODY, color: C.ink400 }}
                >
                  In stock:{" "}
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      color: short ? C.danger : C.ink600,
                    }}
                  >
                    {fmtQty(stock.qty)} bottles
                  </span>
                </p>
              )}

              {error && (
                <p
                  className="text-[11px] mt-0.5"
                  style={{ fontFamily: FONT_BODY, color: C.danger }}
                >
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ---------- one rate per size being issued ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        {issuedSizes.map((size) => {
          const { value, set } = rateFor(size.value);
          return (
            <Field
              key={size.value}
              label={`Rate per ${size.noun} (LKR)`}
              error={issues?.fields[size.rateKey]}
              hint="Same for every flavor of this size."
            >
              <TextInput
                type="number"
                min="0"
                placeholder="0.00"
                aria-label={`Rate per ${size.noun}`}
                value={value}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          );
        })}
      </div>

      {/* ---------- what the issue comes to ----------
          Each size's quantity times its own rate, so the amount cannot
          disagree with the rows above and is never keyed in. */}
      <div
        className="rounded-lg px-3 py-2.5 mb-3 sm:px-4 sm:py-3 sm:mb-4"
        style={{ background: C.surface, border: `1px solid ${C.line}` }}
      >
        {issuedSizes.map((size) => {
          const { bottles, amount } = totalFor(size.value);
          const rate = Number(rateFor(size.value).value) || 0;
          return (
            <div
              key={size.value}
              className="flex items-center justify-between gap-2 mb-1"
            >
              <span
                className="text-[11px] sm:text-xs"
                style={{ fontFamily: FONT_BODY, color: C.ink600 }}
              >
                {size.label} ·{" "}
                <span style={{ fontFamily: FONT_MONO }}>{fmtQty(bottles)}</span>{" "}
                bottles × <span style={{ fontFamily: FONT_MONO }}>{money(rate)}</span>
              </span>
              <span
                className="text-[13px] font-semibold shrink-0"
                style={{ fontFamily: FONT_MONO, color: C.ink900 }}
              >
                {money(amount)}
              </span>
            </div>
          );
        })}

        <div
          className="flex items-center justify-between gap-2 mt-2 pt-2"
          style={{ borderTop: `1px solid ${C.line}` }}
        >
          <span
            className="text-[11px] font-medium sm:text-xs"
            style={{ fontFamily: FONT_BODY, color: C.ink600 }}
          >
            Total amount issued ({fmtQty(totals.totalBottles)} bottles)
          </span>
          <span
            className="text-[15px] font-semibold shrink-0 sm:text-base"
            style={{ fontFamily: FONT_MONO, color: C.ink900 }}
          >
            {money(totals.totalAmount)}
          </span>
        </div>
      </div>

      <FormErrors messages={issues?.form ?? []} title="This issue cannot be saved" />

      <Field label="Notes (optional)">
        <textarea
          rows={2}
          className={inputClass}
          style={inputStyle}
          placeholder="Vehicle, driver, delivery note number, etc."
          aria-label="Issue notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
    </Modal>
  );
}
