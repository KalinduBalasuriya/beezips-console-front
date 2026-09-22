import { money } from "./format";
import { C } from "./theme";

/**
 * How an account's position is worded and coloured, in one place.
 *
 * Sign convention, used by every balance in the app: negative means the
 * distributor owes us, positive that they have paid ahead. Stock leaves the
 * factory unpaid, so "Due" is the normal state of a working account.
 */
export interface BalanceTone {
  bg: string;
  fg: string;
  /** e.g. `Due 4,500Rs`, `Exceed 1,200Rs`, `Settled` */
  label: string;
}

export function balanceTone(balance: number): BalanceTone {
  if (balance < 0) return { bg: C.dangerBg, fg: C.danger, label: `Due ${money(-balance)}` };
  if (balance > 0) return { bg: C.infoBg, fg: C.info, label: `Exceed ${money(balance)}` };
  return { bg: C.successBg, fg: C.success, label: "Settled" };
}
