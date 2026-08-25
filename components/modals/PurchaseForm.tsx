import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { FLAVORS } from "../../data/mockData";
import { money } from "../../lib/format";
import { inputStyle, inputClass } from "../../lib/formStyles";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import Modal from "./Modal";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";

interface PurchaseFormProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function PurchaseForm({ onClose, onSaved }: PurchaseFormProps) {
  const [category, setCategory] = useState<string>("Glass bottles");
  const [flavor, setFlavor] = useState<string>(FLAVORS[0]);
  const [qty, setQty] = useState<string>("");
  const [unit, setUnit] = useState<string>("pcs");
  const [price, setPrice] = useState<string>("");
  const total = (Number(qty) || 0) * (Number(price) || 0);

  return (
    <Modal
      title="Add purchase"
      subtitle="Log a raw-material purchase and update stock"
      icon={ShoppingCart}
      onClose={onClose}
      submitLabel="Save purchase"
      onSubmit={onSaved}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Date">
          <TextInput type="date" defaultValue="2026-08-17" />
        </Field>
        <Field label="Material category">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {[
              "Glass bottles",
              "Lids",
              "Fruits",
              "Sugar",
              "Equipment",
              "Gas",
              "Other",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>

      {category === "Fruits" && (
        <Field label="Flavor / fruit type">
          <Select value={flavor} onChange={(e) => setFlavor(e.target.value)}>
            {FLAVORS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        </Field>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
        <Field label="Quantity">
          <TextInput
            type="number"
            min="0"
            placeholder="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </Field>
        <Field label="Unit">
          <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
            {["pcs", "kg", "L"].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </Field>
        <Field label="Unit price (LKR)">
          <TextInput
            type="number"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Field>
      </div>

      <div
        className="rounded-lg px-3 py-2.5 mb-3 flex items-center justify-between sm:px-4 sm:py-3 sm:mb-4"
        style={{ background: C.surface, border: `1px solid ${C.line}` }}
      >
        <span
          className="text-xs font-medium"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          Total amount
        </span>
        <span
          className="text-sm font-semibold"
          style={{ fontFamily: FONT_MONO, color: C.ink900 }}
        >
          {money(total)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Supplier">
          <TextInput type="text" placeholder="Supplier name" />
        </Field>
        <Field label="Invoice number">
          <TextInput type="text" placeholder="INV-0421" />
        </Field>
      </div>
      <Field label="Notes (optional)">
        <textarea
          rows={2}
          className={inputClass}
          style={inputStyle}
          placeholder="Anything worth remembering about this purchase"
        />
      </Field>
    </Modal>
  );
}
