import { z } from "zod";
import { DISTRIBUTORS } from "../data/mockData";
import { findItem, requiredQuantities } from "./production";
import { toISODate } from "./period";
import type { ExpenseCategory, PaymentMethod } from "./types";

/**
 * Validation for every Quick Action form.
 *
 * The schemas live here rather than in the components so the rules are stated
 * once, are readable end to end, and can be exercised without mounting a form.
 * Inputs arrive as strings from the DOM, so the numeric fields coerce and are
 * rejected together for blank, non-numeric, zero and negative values — one
 * message per field rather than a different one per failure mode.
 */

/* ---------- option lists, shared with the selects that render them ---------- */

export const EXPENSE_CATEGORIES = [
  "Electricity",
  "Water",
  "Fuel",
  "Transport",
  "Labor",
  "Rent",
  "Maintenance",
  "Other",
] as const;

export const PAYMENT_METHODS = ["Cash", "Bank transfer", "Cheque"] as const;

export const PURCHASE_CATEGORIES = [
  "Glass bottles",
  "Lids",
  "Fruits",
  "Sugar",
  "Equipment",
  "Gas",
  "Other",
] as const;

export const PURCHASE_UNITS = ["pcs", "kg", "L"] as const;

/* compile-time guard: these lists must stay in step with the domain types, so
   a rename in types.ts fails the build here rather than silently drifting */
const _categories: readonly ExpenseCategory[] = EXPENSE_CATEGORIES;
const _methods: readonly PaymentMethod[] = PAYMENT_METHODS;
void _categories;
void _methods;

/* ---------- reusable field rules ---------- */

/** A number typed into an input: blank, non-numeric, zero and negative all
 *  fail with the same message, because to the user they are one mistake. */
const positiveNumber = (message: string) =>
  z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : v.trim() === "" ? Number.NaN : Number(v)))
    .refine((n) => Number.isFinite(n) && n > 0, message);

/** As above, but must also be a whole number — you cannot bottle half a bottle. */
const positiveCount = (message: string) =>
  positiveNumber(message).refine(Number.isInteger, "Enter a whole number.");

/** An optional count that defaults to zero when left blank. */
const optionalCount = (message: string) =>
  z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : v.trim() === "" ? 0 : Number(v)))
    .refine((n) => Number.isFinite(n) && n >= 0 && Number.isInteger(n), message);

const requiredText = (message: string) => z.string().trim().min(1, message);

/** A business date: present, well formed, and never in the future — the
 *  dashboard's period rule excludes future records, so accepting one here
 *  would create a row no report could ever show. */
const businessDate = z
  .string()
  .min(1, "Choose a date.")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .refine((v) => v <= toISODate(new Date()), "The date cannot be in the future.");

/* ---------- Add production ---------- */

export const productionSchema = z
  .object({
    date: businessDate,
    rows: z
      .array(
        z.object({
          flavor: requiredText("Choose a flavor."),
          bottleSize: z.enum(["LARGE", "SMALL"], { message: "Choose a bottle size." }),
          kg: positiveNumber("Enter the fruit used, in kg."),
          bottles: positiveCount("Enter the bottles produced."),
        }),
      )
      .min(1, "Add at least one flavor."),
    materials: z.array(
      z.object({
        material: requiredText("Choose a raw material."),
        quantity: positiveNumber("Enter the quantity used."),
      }),
    ),
    notes: z.string().optional(),
  })
  .superRefine((batch, ctx) => {
    /* the same flavor at the same size twice would double-count one run */
    const seenRows = new Map<string, number>();
    batch.rows.forEach((row, index) => {
      const key = `${row.flavor}__${row.bottleSize}`;
      if (seenRows.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["rows", index, "flavor"],
          message: `${row.flavor} (${row.bottleSize === "LARGE" ? "Large" : "Small"}) is already listed — combine the rows.`,
        });
      }
      seenRows.set(key, index);
    });

    const seenMaterials = new Set<string>();
    batch.materials.forEach((m, index) => {
      if (seenMaterials.has(m.material)) {
        ctx.addIssue({
          code: "custom",
          path: ["materials", index, "material"],
          message: `${m.material} is already listed.`,
        });
      }
      seenMaterials.add(m.material);
    });

    /* stock check — a batch must not consume more than is on hand. Skipped
       when a quantity failed to parse, since the arithmetic would be noise. */
    const usable =
      batch.rows.every((r) => Number.isFinite(r.bottles) && Number.isFinite(r.kg)) &&
      batch.materials.every((m) => Number.isFinite(m.quantity));
    if (!usable) return;

    const required = requiredQuantities(
      batch.rows.map((r) => ({
        flavor: r.flavor,
        bottleSize: r.bottleSize,
        kg: String(r.kg),
        bottles: String(r.bottles),
      })),
      batch.materials.map((m) => ({ material: m.material, quantity: String(m.quantity) })),
    );

    for (const [name, needed] of required) {
      if (needed <= 0) continue;
      const item = findItem(name);
      if (!item) {
        ctx.addIssue({ code: "custom", message: `${name} is not in the inventory register.` });
        continue;
      }
      if (needed > item.qty) {
        ctx.addIssue({
          code: "custom",
          message: `Not enough ${item.name}: ${needed.toLocaleString()} ${item.unit} needed, ${item.qty.toLocaleString()} ${item.unit} in stock.`,
        });
      }
    }
  });

export type ProductionInput = z.input<typeof productionSchema>;

/* ---------- Add expense ---------- */

export const expenseSchema = z.object({
  date: businessDate,
  category: z.enum(EXPENSE_CATEGORIES, { message: "Choose a category." }),
  amount: positiveNumber("Enter the amount."),
  method: z.enum(PAYMENT_METHODS, { message: "Choose a payment method." }),
  description: requiredText("Describe what this expense was for."),
});

export type ExpenseInput = z.input<typeof expenseSchema>;

/* ---------- Record distributor payment ---------- */

export const incomeSchema = z.object({
  date: businessDate,
  distributorId: z.coerce
    .number()
    .refine((id) => DISTRIBUTORS.some((d) => d.id === id), "Choose a distributor."),
  amount: positiveNumber("Enter the amount received."),
  bottlesReturned: optionalCount("Returned bottles must be a whole number, or blank."),
  method: z.enum(PAYMENT_METHODS, { message: "Choose a payment method." }),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type IncomeInput = z.input<typeof incomeSchema>;

/* ---------- Add purchase ---------- */

export const purchaseSchema = z
  .object({
    date: businessDate,
    category: z.enum(PURCHASE_CATEGORIES, { message: "Choose a material category." }),
    /* only meaningful for fruit purchases; required conditionally below */
    flavor: z.string().optional(),
    quantity: positiveNumber("Enter the quantity."),
    unit: z.enum(PURCHASE_UNITS, { message: "Choose a unit." }),
    unitPrice: positiveNumber("Enter the unit price."),
    supplier: requiredText("Enter the supplier."),
    invoice: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((purchase, ctx) => {
    if (purchase.category === "Fruits" && !purchase.flavor?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["flavor"],
        message: "Choose which fruit this purchase is for.",
      });
    }
  });

export type PurchaseInput = z.input<typeof purchaseSchema>;

/* ---------- turning a ZodError into something a form can render ---------- */

export interface FormIssues {
  /** keyed by dot path, e.g. `amount` or `rows.1.bottles` */
  fields: Record<string, string>;
  /** issues that belong to the whole form rather than one input */
  form: string[];
}

/** First message per field wins — showing three complaints about one input at
 *  once is noise, and fixing the first usually clears the rest. */
export function collectIssues(error: z.ZodError): FormIssues {
  const fields: Record<string, string> = {};
  const form: string[] = [];

  for (const issue of error.issues) {
    if (issue.path.length === 0) {
      if (!form.includes(issue.message)) form.push(issue.message);
      continue;
    }
    const key = issue.path.join(".");
    if (!(key in fields)) fields[key] = issue.message;
  }
  return { fields, form };
}

/** Validates and returns either the parsed value or renderable issues. */
export function validate<S extends z.ZodType>(
  schema: S,
  value: unknown,
): { ok: true; data: z.output<S> } | { ok: false; issues: FormIssues } {
  const result = schema.safeParse(value);
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, issues: collectIssues(result.error) };
}
