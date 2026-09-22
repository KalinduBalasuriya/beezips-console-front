import { useState } from "react";
import { HandCoins, Plus, Trash2 } from "lucide-react";
import { DISTRIBUTORS, FLAVORS } from "../../data/mockData";
import { distributorTrade } from "../../lib/selectors";
import { balanceTone } from "../../lib/balance";
import {
  hasSize,
  lineTotals,
  type BottleLineInput,
} from "../../lib/issue";
import {
  incomeSchema,
  validate,
  PAYMENT_METHODS,
  type IncomeInput,
  type FormIssues,
} from "../../lib/schemas";
import { money, qty as fmtQty } from "../../lib/format";
import { inputStyle, inputClass } from "../../lib/formStyles";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import Modal from "./Modal";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";
import FormErrors from "./FormErrors";
import type { BottleSize } from "../../lib/types";

interface IncomeFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const emptyReturn = (): BottleLineInput => ({
  flavor: FLAVORS[0],
  bottleSize: "LARGE",
  bottles: "",
});

interface SizeOption {
  value: BottleSize;
  label: string;
  /** as it reads mid-sentence, e.g. "large bottle" */
  noun: string;
  rateKey: "largePrice" | "smallPrice";
}

const SIZES: SizeOption[] = [
  { value: "LARGE", label: "Large", noun: "large bottle", rateKey: "largePrice" },
  { value: "SMALL", label: "Small", noun: "small bottle", rateKey: "smallPrice" },
];

const initial: IncomeInput = {
  date: "2026-09-01",
  distributorId: DISTRIBUTORS[1].id,
  amount: "",
  returns: [],
  largePrice: "",
  smallPrice: "",
  method: "Cash",
  reference: "",
  notes: "",
};

/**
 * Record distributor payment.
 *
 * A distributor settles for stock taken earlier and brings the unsold bottles
 * back with the money, so the returned quantities are part of this form rather
 * than a separate one: flavor, size and count per line, credited at a rate per
 * size the same way the issue charged them. Both the cash and that credit come
 * off what they owe, which is why the running balance below counts them
 * together. Returns are optional — a payment can arrive on its own.
 */
export default function IncomeForm({ onClose, onSaved }: IncomeFormProps) {
  const [values, setValues] = useState<IncomeInput>(initial);
  const [issues, setIssues] = useState<FormIssues | null>(null);

  const set = <K extends keyof IncomeInput>(key: K, value: IncomeInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setIssues((i) => (i ? { ...i, fields: { ...i.fields, [key]: "" } } : i));
  };

  const errorFor = (key: string) => issues?.fields[key] || undefined;

  /* the returned lines, held as the schema takes them */
  const returns = (values.returns ?? []) as BottleLineInput[];
  const setReturns = (next: BottleLineInput[]) => set("returns", next);
  const addReturn = () => setReturns([...returns, emptyReturn()]);
  const removeReturn = (i: number) => setReturns(returns.filter((_, idx) => idx !== i));
  const updateReturn = (i: number, patch: Partial<BottleLineInput>) =>
    setReturns(returns.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  /* one message per line: the first unresolved complaint about any of its
     fields, so a half-filled line shows a single line rather than three */
  const returnErrorFor = (index: number) => {
    const fields = issues?.fields ?? {};
    const key = Object.keys(fields).find(
      (k) => k.startsWith("returns." + index + ".") && fields[k],
    );
    return key ? fields[key] : undefined;
  };

  const rateFor = (size: BottleSize) =>
    size === "LARGE"
      ? { value: String(values.largePrice ?? ""), key: "largePrice" as const }
      : { value: String(values.smallPrice ?? ""), key: "smallPrice" as const };

  /* only the sizes actually coming back: a rate for a size nobody returned
     would be noise, and the schema does not ask for it either */
  const returnedSizes = SIZES.filter((s) => hasSize(returns, s.value));

  const credit = lineTotals({
    lines: returns,
    largePrice: values.largePrice ?? 0,
    smallPrice: values.smallPrice ?? 0,
  });

  const dist = DISTRIBUTORS.find((d) => d.id === Number(values.distributorId));
  /* what the records say they owe: stock taken, less returns, less what they
     have already paid */
  const balance = dist ? distributorTrade(dist.name).balance : 0;
  const received = Number(values.amount) || 0;
  /* cash and returned stock both reduce what the distributor owes */
  const newBalance = balance + received + credit.totalAmount;

  const submit = () => {
    const result = validate(incomeSchema, values);
    if (!result.ok) {
      setIssues(result.issues);
      return;
    }
    setIssues(null);
    onSaved();
  };

  const balanceLabel = (value: number) => balanceTone(value).label;

  return (
    <Modal
      title="Record distributor payment"
      subtitle="Log cash received and the bottles that came back with it"
      icon={HandCoins}
      onClose={onClose}
      submitLabel="Record payment"
      onSubmit={submit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Date" error={errorFor("date")}>
          <TextInput
            type="date"
            aria-label="Payment date"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
        <Field label="Distributor" error={errorFor("distributorId")}>
          <Select
            aria-label="Distributor"
            value={String(values.distributorId)}
            onChange={(e) => set("distributorId", Number(e.target.value))}
          >
            {DISTRIBUTORS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div
        className="rounded-lg px-3 py-2.5 mb-3 flex items-center justify-between sm:px-4 sm:py-3 sm:mb-4"
        style={{
          background: balance < 0 ? C.dangerBg : balance > 0 ? C.infoBg : C.surface,
          border: `1px solid ${C.line}`,
        }}
      >
        <span
          className="text-[11px] font-medium sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          Current balance
        </span>
        <span
          className="text-sm font-semibold"
          style={{
            fontFamily: FONT_MONO,
            color: balance < 0 ? C.danger : balance > 0 ? C.info : C.ink900,
          }}
        >
          {balanceLabel(balance)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Amount received (LKR)" error={errorFor("amount")}>
          <TextInput
            type="number"
            min="0"
            placeholder="0.00"
            aria-label="Amount received"
            value={String(values.amount)}
            onChange={(e) => set("amount", e.target.value)}
          />
        </Field>
        <Field label="Payment method" error={errorFor("method")}>
          <Select
            aria-label="Payment method"
            value={values.method}
            onChange={(e) => set("method", e.target.value as IncomeInput["method"])}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </Field>
      </div>

      {/* ---------- bottles returned with the payment ---------- */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] font-medium sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          Bottles returned
        </span>
        <button
          type="button"
          onClick={addReturn}
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

      {returns.length === 0 ? (
        <p className="text-[11px] mb-3" style={{ fontFamily: FONT_BODY, color: C.ink400 }}>
          Nothing came back with this payment. Add a flavor for each kind of
          bottle the distributor returned.
        </p>
      ) : (
        <div className="space-y-3 mb-3">
          {returns.map((line, i) => {
            const error = returnErrorFor(i);
            return (
              <div key={i}>
                {/* on a phone the flavor and size selects share the top line,
                    with the quantity and remove on the line below */}
                <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
                  <div className="col-span-2 sm:col-span-1">
                    <Select
                      value={line.flavor}
                      onChange={(e) => updateReturn(i, { flavor: e.target.value })}
                      aria-label={`Flavor for returned row ${i + 1}`}
                    >
                      {FLAVORS.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Select
                      value={line.bottleSize}
                      onChange={(e) =>
                        updateReturn(i, { bottleSize: e.target.value as BottleSize })
                      }
                      aria-label={`Bottle size for returned row ${i + 1}`}
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
                      aria-label={`Bottles returned for row ${i + 1}`}
                      value={String(line.bottles)}
                      onChange={(e) => updateReturn(i, { bottles: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeReturn(i)}
                    className="flex items-center justify-center h-10 w-10 shrink-0 rounded-md transition-colors hover:bg-black/5 sm:h-9 sm:w-9"
                    aria-label={`Remove returned row ${i + 1}`}
                  >
                    <Trash2 size={15} color={C.danger} />
                  </button>
                </div>

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
      )}

      {/* one rate per size coming back, credited as the issue charged it */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        {returnedSizes.map((size) => {
          const rate = rateFor(size.value);
          return (
            <Field
              key={size.value}
              label={`Rate per returned ${size.noun} (LKR)`}
              error={errorFor(size.rateKey)}
              hint="Same for every flavor of this size."
            >
              <TextInput
                type="number"
                min="0"
                placeholder="0.00"
                aria-label={`Rate per returned ${size.noun}`}
                value={rate.value}
                onChange={(e) => set(rate.key, e.target.value)}
              />
            </Field>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Reference (optional)" error={errorFor("reference")}>
          <TextInput
            type="text"
            placeholder="RCP-0092"
            aria-label="Payment reference"
            value={values.reference ?? ""}
            onChange={(e) => set("reference", e.target.value)}
          />
        </Field>
      </div>

      {/* ---------- what this payment settles ---------- */}
      <div
        className="rounded-lg px-3 py-2.5 mb-3 sm:px-4 sm:py-3 sm:mb-4"
        style={{ background: C.surface, border: `1px solid ${C.line}` }}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className="text-[11px] sm:text-xs"
            style={{ fontFamily: FONT_BODY, color: C.ink600 }}
          >
            Cash received
          </span>
          <span
            className="text-[13px] font-semibold shrink-0"
            style={{ fontFamily: FONT_MONO, color: C.ink900 }}
          >
            {money(received)}
          </span>
        </div>

        {returnedSizes.map((size) => {
          const bottles =
            size.value === "LARGE" ? credit.largeBottles : credit.smallBottles;
          const amount =
            size.value === "LARGE" ? credit.largeAmount : credit.smallAmount;
          return (
            <div
              key={size.value}
              className="flex items-center justify-between gap-2 mb-1"
            >
              <span
                className="text-[11px] sm:text-xs"
                style={{ fontFamily: FONT_BODY, color: C.ink600 }}
              >
                {size.label} returned ·{" "}
                <span style={{ fontFamily: FONT_MONO }}>{fmtQty(bottles)}</span> bottles
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
            New balance after this payment
          </span>
          <span
            className="text-xs sm:text-sm font-semibold shrink-0"
            style={{
              fontFamily: FONT_MONO,
              color: newBalance < 0 ? C.danger : newBalance > 0 ? C.info : C.success,
            }}
          >
            {balanceLabel(newBalance)}
          </span>
        </div>
      </div>

      <FormErrors messages={issues?.form ?? []} title="This payment cannot be saved" />

      <Field label="Notes (optional)">
        <textarea
          rows={2}
          className={inputClass}
          style={inputStyle}
          placeholder="Payment reference, partial payment reason, etc."
          aria-label="Payment notes"
          value={values.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
    </Modal>
  );
}
