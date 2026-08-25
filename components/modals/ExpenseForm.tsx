import { Receipt } from "lucide-react";
import { C, FONT_BODY } from "../../lib/theme";
import Modal from "./Modal";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";

interface ExpenseFormProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function ExpenseForm({ onClose, onSaved }: ExpenseFormProps) {
  return (
    <Modal
      title="Add expense"
      subtitle="Log an operating cost outside of raw materials"
      icon={Receipt}
      onClose={onClose}
      submitLabel="Save expense"
      onSubmit={onSaved}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Date">
          <TextInput type="date" defaultValue="2026-08-17" />
        </Field>
        <Field label="Category">
          <Select defaultValue="Electricity">
            {["Electricity", "Water", "Fuel", "Transport", "Labor", "Rent", "Maintenance", "Other"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Amount (LKR)">
          <TextInput type="number" min="0" placeholder="0.00" />
        </Field>
        <Field label="Payment method">
          <Select defaultValue="Cash">
            {["Cash", "Bank transfer", "Cheque"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Description">
        <TextInput type="text" placeholder="What was this expense for" />
      </Field>
      <p className="text-xs" style={{ fontFamily: FONT_BODY, color: C.ink400 }}>
        Note: one-off machinery or equipment purchases are tracked under Purchasing and excluded from monthly
        operating costs.
      </p>
    </Modal>
  );
}
