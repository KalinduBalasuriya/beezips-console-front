import { useState } from "react";
import { Factory, Plus, Trash2 } from "lucide-react";
import {
  batchConsumption,
  toCreateProductionRequest,
} from "../../lib/production";
import {
  NOTES_MAX_LENGTH,
  productionSchema,
  validate,
  type FormIssues,
} from "../../lib/schemas";
import { getApiErrorMessages } from "../../lib/api/errors";
import { toISODate } from "../../lib/period";
import { qty as fmtQty } from "../../lib/format";
import { inputStyle, inputClass } from "../../lib/formStyles";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import { useGetFlavorsQuery } from "../../store/api/flavorsApi";
import { useGetSelectableRawMaterialsQuery } from "../../store/api/rawMaterialsApi";
import { useCreateProductionMutation } from "../../store/api/productionsApi";
import Modal from "./Modal";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";
import { ErrorState, Skeleton } from "../ui/States";
import FormErrors from "./FormErrors";
import type {
  MaterialRowInput,
  ProductionRowInput,
} from "../../lib/production";
import type { RawMaterialDto, RawMaterialUnit } from "../../lib/api/types";

interface ProductionFormProps {
  onClose: () => void;
  onSaved: () => void;
}

/* a new row starts with no flavor chosen, so the operator picks one rather
   than saving whichever happened to be first in the list */
const emptyRow = (): ProductionRowInput => ({
  flavorId: "",
  kg: "",
  largeBottles: "",
  smallBottles: "",
  materials: [],
});

/** How each API unit reads beside a quantity. */
const UNIT_LABEL: Record<RawMaterialUnit, string> = {
  Kg: "kg",
  G: "g",
  L: "L",
  Ml: "ml",
  Pcs: "pcs",
  Cylinder: "cylinders",
};

/* desktop columns shared by the heading row and every flavor row, so the
   headings sit exactly over their inputs; the last track is the remove button */
const ROW_GRID =
  "sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_2.5rem] sm:gap-2";

/* the three quantities each flavor row takes; fruit kg covers both sizes */
const QUANTITY_FIELDS: {
  key: "kg" | "largeBottles" | "smallBottles";
  caption: string;
  placeholder: string;
  aria: string;
}[] = [
  { key: "kg", caption: "Fruit (kg)", placeholder: "kg", aria: "Fruit used in kg" },
  { key: "largeBottles", caption: "Large bottles", placeholder: "0", aria: "Large bottles produced" },
  { key: "smallBottles", caption: "Small bottles", placeholder: "0", aria: "Small bottles produced" },
];

export default function ProductionForm({
  onClose,
  onSaved,
}: ProductionFormProps) {
  const flavorsQuery = useGetFlavorsQuery();
  const materialsQuery = useGetSelectableRawMaterialsQuery();
  const [createProduction, { isLoading: saving }] = useCreateProductionMutation();

  const [rows, setRows] = useState<ProductionRowInput[]>([emptyRow()]);
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [notes, setNotes] = useState("");
  /* problems stay hidden until the first save attempt, so a half-typed row
     is not scolded while the user is still filling it in */
  const [issues, setIssues] = useState<FormIssues | null>(null);
  /* what the API rejected the last save with; cleared on the next attempt */
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const flavors = flavorsQuery.data ?? [];
  const materialOptions = materialsQuery.data ?? [];
  const optionsLoading = flavorsQuery.isLoading || materialsQuery.isLoading;
  const optionsFailed = flavorsQuery.isError || materialsQuery.isError;
  const ready = !optionsLoading && !optionsFailed && flavors.length > 0;

  const materialById = new Map<number, RawMaterialDto>(
    materialOptions.map((m) => [m.id, m]),
  );

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<ProductionRowInput>) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addMaterial = (i: number) =>
    updateRow(i, {
      materials: [
        ...rows[i].materials,
        { rawMaterialId: String(materialOptions[0]?.id ?? ""), quantity: "" },
      ],
    });
  const removeMaterial = (i: number, m: number) =>
    updateRow(i, { materials: rows[i].materials.filter((_, idx) => idx !== m) });
  const updateMaterial = (i: number, m: number, patch: Partial<MaterialRowInput>) =>
    updateRow(i, {
      materials: rows[i].materials.map((mat, idx) =>
        idx === m ? { ...mat, ...patch } : mat,
      ),
    });

  /* one message per line: the first unresolved complaint about any of its
     fields, so a half-filled row shows a single line rather than four. A
     flavor row's own line leaves its materials to speak for themselves. */
  const firstIssue = (prefix: string, exclude?: string) => {
    const fields = issues?.fields ?? {};
    const key = Object.keys(fields).find(
      (k) =>
        k.startsWith(prefix) && !(exclude && k.startsWith(exclude)) && fields[k],
    );
    return key ? fields[key] : undefined;
  };

  const consumption = batchConsumption(rows);

  const submit = async () => {
    if (saving) return;
    const result = validate(productionSchema, { date, rows, notes });
    if (!result.ok) {
      setIssues(result.issues);
      return;
    }
    setIssues(null);
    setServerErrors([]);

    try {
      await createProduction(toCreateProductionRequest(result.data)).unwrap();
      onSaved();
    } catch (error) {
      setServerErrors(
        getApiErrorMessages(error as Parameters<typeof getApiErrorMessages>[0]),
      );
    }
  };

  const retryOptions = () => {
    if (flavorsQuery.isError) flavorsQuery.refetch();
    if (materialsQuery.isError) materialsQuery.refetch();
  };

  return (
    <Modal
      title="Add production"
      subtitle="Record a production batch and consume raw stock"
      icon={Factory}
      onClose={onClose}
      submitLabel="Save production"
      onSubmit={submit}
      submitting={saving}
      submitDisabled={!ready}
    >
      {optionsLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading form">
          <Skeleton className="h-10 w-full max-w-55" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : optionsFailed ? (
        <ErrorState
          message="Could not load flavors and materials."
          onRetry={retryOptions}
        />
      ) : flavors.length === 0 ? (
        <p
          className="text-[13px]"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          No flavors are set up yet. Add a flavor before recording production.
        </p>
      ) : (
        <>
          <Field label="Date" error={issues?.fields.date}>
            <TextInput
              type="date"
              aria-label="Production date"
              style={{ maxWidth: 220 }}
              max={toISODate(new Date())}
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
              disabled={rows.length >= flavors.length}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 min-h-11 rounded-md transition-colors hover:bg-black/5 disabled:opacity-40 sm:min-h-9 sm:text-xs"
              style={{
                fontFamily: FONT_BODY,
                color: C.brandInk,
                border: `1px solid ${C.line}`,
              }}
            >
              <Plus size={13} aria-hidden /> Add flavor
            </button>
          </div>

          {/* desktop column headings; on a phone each field carries its own caption */}
          <div
            className={`hidden ${ROW_GRID} mb-1 px-3 text-[10px] uppercase tracking-wide sm:grid`}
            style={{ fontFamily: FONT_BODY, color: C.ink400 }}
            aria-hidden
          >
            <span>Flavor</span>
            {QUANTITY_FIELDS.map((f) => (
              <span key={f.key} className="truncate">
                {f.caption}
              </span>
            ))}
          </div>

          <div className="space-y-3 mb-4 sm:space-y-2 sm:mb-5">
            {rows.map((row, i) => {
              const error = firstIssue(`rows.${i}.`, `rows.${i}.materials.`);
              return (
                <div
                  key={i}
                  className="rounded-lg p-2.5 sm:p-3"
                  style={{ border: `1px solid ${C.line}` }}
                >
                  {/* on a phone the flavor select and remove button share the top
                      line, with kg / large / small on the line below; from sm up
                      the quantities join the main grid as one line */}
                  <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 ${ROW_GRID} sm:items-center`}>
                    <div className="min-w-0">
                      <Select
                        value={row.flavorId}
                        onChange={(e) => updateRow(i, { flavorId: e.target.value })}
                        aria-label={`Flavor for row ${i + 1}`}
                      >
                        <option value="" disabled>
                          Choose flavor
                        </option>
                        {flavors.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      disabled={rows.length === 1}
                      className="flex items-center justify-center h-11 w-11 shrink-0 rounded-md transition-colors hover:bg-black/5 disabled:opacity-30 sm:order-last sm:h-10 sm:w-10"
                      aria-label={`Remove flavor row ${i + 1}`}
                    >
                      <Trash2 size={15} color={C.danger} />
                    </button>
                    <div className="col-span-2 grid grid-cols-3 gap-2 sm:contents">
                      {QUANTITY_FIELDS.map((f) => (
                        <label key={f.key} className="block min-w-0">
                          <span
                            className="block text-[10px] uppercase tracking-wide mb-0.5 sm:hidden"
                            style={{ fontFamily: FONT_BODY, color: C.ink400 }}
                          >
                            {f.caption}
                          </span>
                          <TextInput
                            type="number"
                            min="0"
                            inputMode={f.key === "kg" ? "decimal" : "numeric"}
                            placeholder={f.placeholder}
                            aria-label={`${f.aria} for row ${i + 1}`}
                            value={row[f.key]}
                            onChange={(e) => updateRow(i, { [f.key]: e.target.value })}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ fontFamily: FONT_BODY, color: C.danger }}
                    >
                      {error}
                    </p>
                  )}

                  {/* ---------- this flavor's other raw materials (spec §48.6) ----------
                      Each flavor is saved as its own production, so what it
                      consumed beyond fruit and packaging is recorded against it. */}
                  <div className="mt-2.5 space-y-2">
                    {row.materials.map((m, j) => {
                      const material = materialById.get(Number(m.rawMaterialId));
                      const materialError = firstIssue(`rows.${i}.materials.${j}.`);
                      return (
                        <div key={j}>
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto]">
                            <div className="col-span-2 min-w-0 sm:col-span-1">
                              <Select
                                value={m.rawMaterialId}
                                onChange={(e) =>
                                  updateMaterial(i, j, { rawMaterialId: e.target.value })
                                }
                                aria-label={`Raw material ${j + 1} for flavor row ${i + 1}`}
                              >
                                {materialOptions.map((opt) => (
                                  <option key={opt.id} value={opt.id}>
                                    {opt.name} ({UNIT_LABEL[opt.unit]})
                                  </option>
                                ))}
                              </Select>
                            </div>
                            <TextInput
                              type="number"
                              min="0"
                              inputMode="decimal"
                              placeholder={
                                material ? `Qty (${UNIT_LABEL[material.unit]})` : "Quantity"
                              }
                              aria-label={`Quantity of raw material ${j + 1} for flavor row ${i + 1}`}
                              value={m.quantity}
                              onChange={(e) =>
                                updateMaterial(i, j, { quantity: e.target.value })
                              }
                            />
                            <button
                              type="button"
                              onClick={() => removeMaterial(i, j)}
                              className="flex items-center justify-center h-11 w-11 shrink-0 rounded-md transition-colors hover:bg-black/5 sm:h-10 sm:w-10"
                              aria-label={`Remove raw material ${j + 1} from flavor row ${i + 1}`}
                            >
                              <Trash2 size={15} color={C.danger} />
                            </button>
                          </div>

                          {materialError && (
                            <p
                              className="text-[11px] mt-0.5"
                              style={{ fontFamily: FONT_BODY, color: C.danger }}
                            >
                              {materialError}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => addMaterial(i)}
                      disabled={materialOptions.length === 0}
                      className="flex items-center gap-1 text-[11px] font-medium px-2 min-h-11 rounded-md transition-colors hover:bg-black/5 disabled:opacity-40 sm:min-h-8 sm:text-xs"
                      style={{ fontFamily: FONT_BODY, color: C.brandInk }}
                    >
                      <Plus size={13} aria-hidden /> Add raw material
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p
            className="text-[11px] -mt-2 mb-4"
            style={{ fontFamily: FONT_BODY, color: C.ink400 }}
          >
            Fruit, empty bottles, lids and labels are counted automatically. Add
            sugar, citric acid or any other consumable each flavor used.
          </p>

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
                { label: "Bottles (Large)", value: consumption.largeBottles },
                { label: "Bottles (Small)", value: consumption.smallBottles },
                { label: "Lids", value: consumption.lids },
                { label: "Labels", value: consumption.labels },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt
                    className="text-[10px] uppercase tracking-wide"
                    style={{ color: C.ink400 }}
                  >
                    {label}
                  </dt>
                  <dd
                    className="text-[13px] font-semibold"
                    style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                  >
                    {fmtQty(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

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
              {fmtQty(consumption.totalBottles)}
            </span>
          </div>

          {/* ---------- batch-wide problems, from the form or from the API ---------- */}
          <FormErrors
            messages={[...(issues?.form ?? []), ...serverErrors]}
            title="This batch cannot be saved"
          />

          <Field label="Batch notes (optional)" error={issues?.fields.notes}>
            <textarea
              rows={2}
              maxLength={NOTES_MAX_LENGTH}
              className={inputClass}
              style={inputStyle}
              placeholder="Machine downtime, wastage, etc."
              aria-label="Batch notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </>
      )}
    </Modal>
  );
}
