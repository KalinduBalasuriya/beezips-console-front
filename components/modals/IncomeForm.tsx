import { useState } from "react";
import { HandCoins } from "lucide-react";
import { DISTRIBUTORS } from "../../data/mockData";
import {
  incomeSchema,
  validate,
  PAYMENT_METHODS,
  type IncomeInput,
  type FormIssues,
} from "../../lib/schemas";
import { money } from "../../lib/format";
import { inputStyle, inputClass } from "../../lib/formStyles";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import Modal from "./Modal";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";
import FormErrors from "./FormErrors";

interface IncomeFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const initial: IncomeInput = {
  date: "2026-09-01",
  distributorId: DISTRIBUTORS[1].id,
  amount: "",
  bottlesReturned: "",
  method: "Cash",
  reference: "",
  notes: "",
};

export default function IncomeForm({ onClose, onSaved }: IncomeFormProps) {
  const [values, setValues] = useState<IncomeInput>(initial);
  const [issues, setIssues] = useState<FormIssues | null>(null);

  const set = <K extends keyof IncomeInput>(key: K, value: IncomeInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setIssues((i) => (i ? { ...i, fields: { ...i.fields, [key]: "" } } : i));
  };

  const errorFor = (key: string) => issues?.fields[key] || undefined;

  const dist = DISTRIBUTORS.find((d) => d.id === Number(values.distributorId));
  const balance = dist?.balance ?? 0;
  const received = Number(values.amount) || 0;
  const newBalance = balance + received;

  const submit = () => {
    const result = validate(incomeSchema, values);
    if (!result.ok) {
      setIssues(result.issues);
      return;
    }
    setIssues(null);
    onSaved();
  };

  const balanceLabel = (value: number) =>
    value === 0 ? "Settled" : value < 0 ? `Due ${money(-value)}` : `Exceed ${money(value)}`;

  return (
    <Modal
      title="Record distributor payment"
      subtitle="Log cash received and update the distributor's balance"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Returned bottles qty" error={errorFor("bottlesReturned")}>
          <TextInput
            type="number"
            min="0"
            placeholder="0"
            aria-label="Returned bottles"
            value={String(values.bottlesReturned)}
            onChange={(e) => set("bottlesReturned", e.target.value)}
          />
        </Field>
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

      <div
        className="rounded-lg gap-x-2 px-3 py-2.5 mb-3 flex items-center justify-between sm:px-4 sm:py-3 sm:mb-4"
        style={{ background: C.surface, border: `1px solid ${C.line}` }}
      >
        <span
          className="text-[11px] font-medium sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          New balance after this payment
        </span>
        <span
          className="text-xs sm:text-sm font-semibold"
          style={{
            fontFamily: FONT_MONO,
            color: newBalance < 0 ? C.danger : newBalance > 0 ? C.info : C.success,
          }}
        >
          {balanceLabel(newBalance)}
        </span>
      </div>

      <FormErrors messages={issues?.form ?? []} />

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
