import { useState } from "react";
import { HandCoins } from "lucide-react";
import { DISTRIBUTORS } from "../../data/mockData";
import { money } from "../../lib/format";
import { inputStyle, inputClass } from "../../lib/formStyles";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import Modal from "./Modal";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";

interface IncomeFormProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function IncomeForm({ onClose, onSaved }: IncomeFormProps) {
  const [distId, setDistId] = useState<number>(DISTRIBUTORS[1].id);
  const [received, setReceived] = useState<string>("");
  const dist = DISTRIBUTORS.find((d) => d.id === Number(distId))!;
  const newBalance = (dist?.balance || 0) + (Number(received) || 0);

  return (
    <Modal
      title="Record distributor payment"
      subtitle="Log cash received and update the distributor's balance"
      icon={HandCoins}
      onClose={onClose}
      submitLabel="Record payment"
      onSubmit={onSaved}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Date">
          <TextInput type="date" defaultValue="2026-08-17" />
        </Field>
        <Field label="Distributor">
          <Select
            value={distId}
            onChange={(e) => setDistId(Number(e.target.value))}
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
          background:
            dist.balance < 0
              ? C.dangerBg
              : dist.balance > 0
                ? C.infoBg
                : C.surface,
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
            color:
              dist.balance < 0
                ? C.danger
                : dist.balance > 0
                  ? C.info
                  : C.ink900,
          }}
        >
          {dist.balance === 0
            ? "Settled"
            : dist.balance < 0
              ? `Due ${money(-dist.balance)}`
              : `Exceed ${money(dist.balance)}`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Amount received (LKR)">
          <TextInput
            type="number"
            min="0"
            placeholder="0.00"
            value={received}
            onChange={(e) => setReceived(e.target.value)}
          />
        </Field>
        <Field label="Returned bottles qty">
          <TextInput type="number" min="0" placeholder="0" />
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
            color:
              newBalance < 0 ? C.danger : newBalance > 0 ? C.info : C.success,
          }}
        >
          {newBalance === 0
            ? "Settled"
            : newBalance < 0
              ? `Due ${money(-newBalance)}`
              : `Exceed ${money(newBalance)}`}
        </span>
      </div>

      <Field label="Notes (optional)">
        <textarea
          rows={2}
          className={inputClass}
          style={inputStyle}
          placeholder="Payment reference, partial payment reason, etc."
        />
      </Field>
    </Modal>
  );
}
