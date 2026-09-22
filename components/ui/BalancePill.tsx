import { balanceTone } from "../../lib/balance";

interface BalancePillProps {
  /** negative = the distributor owes us, positive = they have paid ahead */
  balance: number;
  /** the tighter rendering used inside a card or table row */
  dense?: boolean;
  className?: string;
}

/** An account's position as a coloured pill — the same wording and colours
 *  wherever a balance is shown. */
export default function BalancePill({ balance, dense = false, className = "" }: BalancePillProps) {
  const tone = balanceTone(balance);
  return (
    <span
      className={`rounded-full font-semibold whitespace-nowrap shrink-0 ${
        dense ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      } ${className}`}
      style={{ background: tone.bg, color: tone.fg }}
    >
      {tone.label}
    </span>
  );
}
