import { useMemo, useState } from "react";
import { Factory, Plus, Trash2 } from "lucide-react";
import { FLAVORS } from "../../data/mockData";
import {
  batchConsumption,
  findItem,
  selectableMaterials,
  BOTTLE_ITEM,
  LID_ITEM,
  LABEL_ITEM,
} from "../../lib/production";
import { productionSchema, validate, type FormIssues } from "../../lib/schemas";
import { qty as fmtQty } from "../../lib/format";
import { inputStyle, inputClass } from "../../lib/formStyles";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import Modal from "./Modal";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";
import FormErrors from "./FormErrors";
import type { BottleSize } from "../../lib/types";
import type {
  MaterialRowInput,
  ProductionRowInput,
} from "../../lib/production";

interface ProductionFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const emptyRow = (): ProductionRowInput => ({
  flavor: FLAVORS[0],
  bottleSize: "LARGE",
  kg: "",
  bottles: "",
});

const SIZES: { value: BottleSize; label: string }[] = [
  { value: "LARGE", label: "Large" },
  { value: "SMALL", label: "Small" },
];

export default function ProductionForm({
  onClose,
  onSaved,
}: ProductionFormProps) {
  const [rows, setRows] = useState<ProductionRowInput[]>([emptyRow()]);
  const [materials, setMaterials] = useState<MaterialRowInput[]>([]);
  const [date, setDate] = useState("2026-09-01");
  const [notes, setNotes] = useState("");
  /* problems stay hidden until the first save attempt, so a half-typed row
     is not scolded while the user is still filling it in */
  const [issues, setIssues] = useState<FormIssues | null>(null);

  const materialOptions = useMemo(() => selectableMaterials(), []);

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<ProductionRowInput>) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addMaterial = () =>
    setMaterials([
      ...materials,
      { material: materialOptions[0]?.name ?? "", quantity: "" },
    ]);
  const removeMaterial = (i: number) =>
    setMaterials(materials.filter((_, idx) => idx !== i));
  const updateMaterial = (i: number, patch: Partial<MaterialRowInput>) =>
    setMaterials(
      materials.map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
    );

  /* one message per row: the first unresolved complaint about any of its
     fields, so a half-filled row shows a single line rather than four */
  const issueFor = (group: "rows" | "materials", index: number) => {
    const fields = issues?.fields ?? {};
    const key = Object.keys(fields).find(
      (k) => k.startsWith(group + "." + index + ".") && fields[k],
    );
    return key ? fields[key] : undefined;
  };

  const consumption = batchConsumption(rows);
  const totalBottles = consumption.totalBottles;

  const submit = () => {
    const result = validate(productionSchema, { date, rows, materials, notes });
    if (!result.ok) {
      setIssues(result.issues);
      return;
    }
    setIssues(null);
    onSaved();
  };

  return (
    <Modal
      title="Add production"
      subtitle="Record a production batch and consume raw stock"
      icon={Factory}
      onClose={onClose}
      submitLabel="Save production"
      onSubmit={submit}
    >
      <Field label="Date" error={issues?.fields.date}>
        <TextInput
          type="date"
          aria-label="Production date"
          style={{ maxWidth: 220 }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>

      {/* ---------- flavors produced ---------- */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] font-medium sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          Flavors produced
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
          const error = issueFor("rows", i);
          return (
            <div key={i}>
              {/* on a phone the flavor and size selects share the top line, with
                  kg / bottles / remove on the line below */}
              <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
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
                <div className="col-span-1 sm:col-span-1">
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
                <TextInput
                  type="number"
                  min="0"
                  placeholder="Fruit kg"
                  aria-label={`Fruit used in kg for row ${i + 1}`}
                  value={row.kg}
                  onChange={(e) => updateRow(i, { kg: e.target.value })}
                />
                <TextInput
                  type="number"
                  min="0"
                  placeholder="Bottles"
                  aria-label={`Bottles produced for row ${i + 1}`}
                  value={row.bottles}
                  onChange={(e) => updateRow(i, { bottles: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  className="flex items-center justify-center h-10 w-10 shrink-0 rounded-md transition-colors hover:bg-black/5 disabled:opacity-30 sm:h-9 sm:w-9"
                  aria-label={`Remove flavor row ${i + 1}`}
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

      {/* ---------- what the batch consumes automatically ----------
          Empty bottles, lids and labels are one per bottle, so none of them is
          an input. This block is the running total across every flavor row and
          updates as the rows are typed. */}
      <div
        className="rounded-lg px-3 py-2.5 mb-4 sm:px-4 sm:py-3 sm:mb-5"
        style={{ background: C.surface, border: `1px solid ${C.line}` }}
      >
        <p
          className="text-[11px] font-medium mb-1.5 sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          Used materials
        </p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
          {[
            {
              label: "Bottles (Large)",
              value: consumption.largeBottles,
              item: BOTTLE_ITEM.LARGE,
            },
            {
              label: "Bottles (Small)",
              value: consumption.smallBottles,
              item: BOTTLE_ITEM.SMALL,
            },
            { label: "Lids", value: consumption.lids, item: LID_ITEM },
            { label: "Labels", value: consumption.labels, item: LABEL_ITEM },
          ].map(({ label, value, item }) => {
            const stock = findItem(item);
            const short = !!stock && value > stock.qty;
            return (
              <div key={label}>
                <dt
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: C.ink400 }}
                >
                  {label}
                </dt>
                <dd
                  className="text-[13px] font-semibold"
                  style={{
                    fontFamily: FONT_MONO,
                    color: short ? C.danger : C.ink900,
                  }}
                >
                  {fmtQty(value)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* ---------- additional raw materials (spec §48.6) ---------- */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] font-medium sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          Other raw materials
        </span>
        <button
          type="button"
          onClick={addMaterial}
          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 min-h-9 rounded-md transition-colors hover:bg-black/5 sm:text-xs"
          style={{
            fontFamily: FONT_BODY,
            color: C.brandInk,
            border: `1px solid ${C.line}`,
          }}
        >
          <Plus size={13} aria-hidden /> Add material
        </button>
      </div>

      {materials.length === 0 ? (
        <p
          className="text-[11px] mb-4"
          style={{ fontFamily: FONT_BODY, color: C.ink400 }}
        >
          Fruit, empty bottles, lids and labels are already counted above. Add
          sugar, citric acid or any other consumable this batch used.
        </p>
      ) : (
        <div className="space-y-3 mb-4 sm:mb-5">
          {materials.map((m, i) => {
            const item = findItem(m.material);
            const error = issueFor("materials", i);
            return (
              <div key={i}>
                <div className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[1.6fr_1fr_auto]">
                  <div className="col-span-2 sm:col-span-1">
                    <Select
                      value={m.material}
                      onChange={(e) =>
                        updateMaterial(i, { material: e.target.value })
                      }
                      aria-label={`Raw material for row ${i + 1}`}
                    >
                      {materialOptions.map((opt) => (
                        <option key={opt.name}>{opt.name}</option>
                      ))}
                    </Select>
                  </div>
                  <TextInput
                    type="number"
                    min="0"
                    placeholder={item ? `Qty (${item.unit})` : "Quantity"}
                    aria-label={`Quantity used for row ${i + 1}`}
                    value={m.quantity}
                    onChange={(e) =>
                      updateMaterial(i, { quantity: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeMaterial(i)}
                    className="flex items-center justify-center h-10 w-10 shrink-0 rounded-md transition-colors hover:bg-black/5 sm:h-9 sm:w-9"
                    aria-label={`Remove material row ${i + 1}`}
                  >
                    <Trash2 size={15} color={C.danger} />
                  </button>
                </div>

                {item && (
                  <p
                    className="text-[11px] mt-1"
                    style={{ fontFamily: FONT_BODY, color: C.ink400 }}
                  >
                    In stock:{" "}
                    <span style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                      {fmtQty(item.qty)} {item.unit}
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
      )}

      {/* ---------- batch total ---------- */}
      <div
        className="rounded-lg px-3 py-2.5 mb-3 flex items-center justify-between sm:px-4 sm:py-3 sm:mb-4"
        style={{ background: C.surface, border: `1px solid ${C.line}` }}
      >
        <span
          className="text-[11px] font-medium sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          Total bottles produced
        </span>
        <span
          className="text-[15px] font-semibold sm:text-base"
          style={{ fontFamily: FONT_MONO, color: C.ink900 }}
        >
          {fmtQty(totalBottles)}
        </span>
      </div>

      {/* ---------- stock shortages and other batch-wide problems (§54) ---------- */}
      <FormErrors messages={issues?.form ?? []} title="This batch cannot be saved" />

      <Field label="Batch notes (optional)">
        <textarea
          rows={2}
          className={inputClass}
          style={inputStyle}
          placeholder="Machine downtime, wastage, etc."
          aria-label="Batch notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
    </Modal>
  );
}
