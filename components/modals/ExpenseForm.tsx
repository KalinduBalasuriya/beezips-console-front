import { useState } from "react";
import { Receipt } from "lucide-react";
import {
  expenseSchema,
  validate,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  type ExpenseInput,
  type FormIssues,
} from "../../lib/schemas";
import { C, FONT_BODY } from "../../lib/theme";
import Modal from "./Modal";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";
import FormErrors from "./FormErrors";

interface ExpenseFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const initial: ExpenseInput = {
  date: "2026-09-01",
  category: "Electricity",
  amount: "",
  method: "Cash",
  description: "",
};

export default function ExpenseForm({ onClose, onSaved }: ExpenseFormProps) {
  const [values, setValues] = useState<ExpenseInput>(initial);
  const [issues, setIssues] = useState<FormIssues | null>(null);

  const set = <K extends keyof ExpenseInput>(key: K, value: ExpenseInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    /* clear this field's complaint as soon as it is edited — leaving it on
       screen while the user fixes it reads as though nothing happened */
    setIssues((i) => (i ? { ...i, fields: { ...i.fields, [key]: "" } } : i));
  };

  const errorFor = (key: string) => issues?.fields[key] || undefined;

  const submit = () => {
    const result = validate(expenseSchema, values);
    if (!result.ok) {
      setIssues(result.issues);
      return;
    }
    setIssues(null);
    onSaved();
  };

  return (
    <Modal
      title="Add expense"
      subtitle="Log an operating cost outside of raw materials"
      icon={Receipt}
      onClose={onClose}
      submitLabel="Save expense"
      onSubmit={submit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Date" error={errorFor("date")}>
          <TextInput
            type="date"
            aria-label="Expense date"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
        <Field label="Category" error={errorFor("category")}>
          <Select
            aria-label="Expense category"
            value={values.category}
            onChange={(e) => set("category", e.target.value as ExpenseInput["category"])}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Amount (LKR)" error={errorFor("amount")}>
          <TextInput
            type="number"
            min="0"
            placeholder="0.00"
            aria-label="Expense amount"
            value={String(values.amount)}
            onChange={(e) => set("amount", e.target.value)}
          />
        </Field>
        <Field label="Payment method" error={errorFor("method")}>
          <Select
            aria-label="Payment method"
            value={values.method}
            onChange={(e) => set("method", e.target.value as ExpenseInput["method"])}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description" error={errorFor("description")}>
        <TextInput
          type="text"
          placeholder="What was this expense for"
          aria-label="Expense description"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <FormErrors messages={issues?.form ?? []} />

      <p className="text-xs" style={{ fontFamily: FONT_BODY, color: C.ink400 }}>
        Note: one-off machinery or equipment purchases are tracked under Purchasing and excluded from
        monthly operating costs.
      </p>
    </Modal>
  );
}
