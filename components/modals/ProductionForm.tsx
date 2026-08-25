import { useState } from "react";
import { Factory, Plus, Trash2 } from "lucide-react";
import { FLAVORS } from "../../data/mockData";
import { inputStyle, inputClass } from "../../lib/formStyles";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import Modal from "./Modal";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";

interface ProductionRow {
  flavor: string;
  kg: string;
  bottles: string;
}

interface ProductionFormProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductionForm({ onClose, onSaved }: ProductionFormProps) {
  const [rows, setRows] = useState<ProductionRow[]>([{ flavor: "Mango", kg: "", bottles: "" }]);
  const addRow = () => setRows([...rows, { flavor: "Mango", kg: "", bottles: "" }]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, key: keyof ProductionRow, val: string) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const totalBottles = rows.reduce((s, r) => s + (Number(r.bottles) || 0), 0);

  return (
    <Modal
      title="Add production"
      subtitle="Record a production batch and consume raw stock"
      icon={Factory}
      onClose={onClose}
      submitLabel="Save production"
      onSubmit={onSaved}
    >
      <Field label="Date">
        <TextInput type="date" defaultValue="2026-08-17" style={{ maxWidth: 220 }} />
      </Field>

      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium sm:text-xs" style={{ fontFamily: FONT_BODY, color: C.ink600 }}>
          Flavors produced
        </span>
        <button
          onClick={addRow}
          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 min-h-9 rounded-md transition-colors hover:bg-black/5 sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.brandInk, border: `1px solid ${C.line}` }}
        >
          <Plus size={13} /> Add flavor
        </button>
      </div>

      <div className="space-y-2 mb-4 sm:mb-5">
        {rows.map((row, i) => (
          /* on a phone the flavor select takes its own full-width line, with
             kg / bottles / remove sharing the line below it */
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:grid-cols-[1.3fr_1fr_1fr_auto]"
          >
            <div className="col-span-3 sm:col-span-1">
              <Select value={row.flavor} onChange={(e) => updateRow(i, "flavor", e.target.value)}>
                {FLAVORS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </Select>
            </div>
            <TextInput
              type="number"
              placeholder="Fruit kg"
              value={row.kg}
              onChange={(e) => updateRow(i, "kg", e.target.value)}
            />
            <TextInput
              type="number"
              placeholder="Bottles"
              value={row.bottles}
              onChange={(e) => updateRow(i, "bottles", e.target.value)}
            />
            <button
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              className="flex items-center justify-center h-10 w-10 shrink-0 rounded-md transition-colors hover:bg-black/5 disabled:opacity-30 sm:h-9 sm:w-9"
              aria-label="Remove row"
            >
              <Trash2 size={15} color={C.danger} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Empty bottles used" hint="Deducted from bottle stock">
          <TextInput type="number" placeholder="Auto from rows above" />
        </Field>
        <Field label="Lids used">
          <TextInput type="number" placeholder="0" />
        </Field>
      </div>

      <div
        className="rounded-lg px-3 py-2.5 mb-3 flex items-center justify-between sm:px-4 sm:py-3 sm:mb-4"
        style={{ background: C.surface, border: `1px solid ${C.line}` }}
      >
        <span className="text-[11px] font-medium sm:text-xs" style={{ fontFamily: FONT_BODY, color: C.ink600 }}>
          Total bottles produced
        </span>
        <span className="text-[15px] font-semibold sm:text-base" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
          {totalBottles.toLocaleString()}
        </span>
      </div>

      <Field label="Batch notes (optional)">
        <textarea rows={2} className={inputClass} style={inputStyle} placeholder="Machine downtime, wastage, etc." />
      </Field>
    </Modal>
  );
}
