import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { FLAVORS } from "../../data/mockData";
import {
  purchaseSchema,
  validate,
  PURCHASE_CATEGORIES,
  PURCHASE_UNITS,
  type PurchaseInput,
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

interface PurchaseFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const initial: PurchaseInput = {
  date: "2026-09-01",
  category: "Glass bottles",
  flavor: FLAVORS[0],
  quantity: "",
  unit: "pcs",
  unitPrice: "",
  supplier: "",
  invoice: "",
  notes: "",
};

export default function PurchaseForm({ onClose, onSaved }: PurchaseFormProps) {
  const [values, setValues] = useState<PurchaseInput>(initial);
  const [issues, setIssues] = useState<FormIssues | null>(null);

  const set = <K extends keyof PurchaseInput>(key: K, value: PurchaseInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setIssues((i) => (i ? { ...i, fields: { ...i.fields, [key]: "" } } : i));
  };

  const errorFor = (key: string) => issues?.fields[key] || undefined;

  const total = (Number(values.quantity) || 0) * (Number(values.unitPrice) || 0);

  const submit = () => {
    const result = validate(purchaseSchema, values);
    if (!result.ok) {
      setIssues(result.issues);
      return;
    }
    setIssues(null);
    onSaved();
  };

  return (
    <Modal
      title="Add purchase"
      subtitle="Log a raw-material purchase and update stock"
      icon={ShoppingCart}
      onClose={onClose}
      submitLabel="Save purchase"
      onSubmit={submit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Date" error={errorFor("date")}>
          <TextInput
            type="date"
            aria-label="Purchase date"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
        <Field label="Material category" error={errorFor("category")}>
          <Select
            aria-label="Material category"
            value={values.category}
            onChange={(e) => set("category", e.target.value as PurchaseInput["category"])}
          >
            {PURCHASE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>

      {values.category === "Fruits" && (
        <Field label="Flavor / fruit type" error={errorFor("flavor")}>
          <Select
            aria-label="Fruit type"
            value={values.flavor ?? ""}
            onChange={(e) => set("flavor", e.target.value)}
          >
            {FLAVORS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        </Field>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
        <Field label="Quantity" error={errorFor("quantity")}>
          <TextInput
            type="number"
            min="0"
            placeholder="0"
            aria-label="Purchase quantity"
            value={String(values.quantity)}
            onChange={(e) => set("quantity", e.target.value)}
          />
        </Field>
        <Field label="Unit" error={errorFor("unit")}>
          <Select
            aria-label="Unit"
            value={values.unit}
            onChange={(e) => set("unit", e.target.value as PurchaseInput["unit"])}
          >
            {PURCHASE_UNITS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </Field>
        <Field label="Unit price (LKR)" error={errorFor("unitPrice")}>
          <TextInput
            type="number"
            min="0"
            placeholder="0.00"
            aria-label="Unit price"
            value={String(values.unitPrice)}
            onChange={(e) => set("unitPrice", e.target.value)}
          />
        </Field>
      </div>

      <div
        className="rounded-lg px-3 py-2.5 mb-3 flex items-center justify-between sm:px-4 sm:py-3 sm:mb-4"
        style={{ background: C.surface, border: `1px solid ${C.line}` }}
      >
        <span
          className="text-[11px] font-medium sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          Total amount
        </span>
        <span
          className="text-[15px] font-semibold sm:text-base"
          style={{ fontFamily: FONT_MONO, color: C.ink900 }}
        >
          {money(total)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Supplier" error={errorFor("supplier")}>
          <TextInput
            type="text"
            placeholder="Supplier name"
            aria-label="Supplier"
            value={values.supplier}
            onChange={(e) => set("supplier", e.target.value)}
          />
        </Field>
        <Field label="Invoice number (optional)" error={errorFor("invoice")}>
          <TextInput
            type="text"
            placeholder="INV-0421"
            aria-label="Invoice number"
            value={values.invoice ?? ""}
            onChange={(e) => set("invoice", e.target.value)}
          />
        </Field>
      </div>

      <FormErrors messages={issues?.form ?? []} />

      <Field label="Notes (optional)">
        <textarea
          rows={2}
          className={inputClass}
          style={inputStyle}
          placeholder="Anything worth remembering about this purchase"
          aria-label="Purchase notes"
          value={values.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
    </Modal>
  );
}
