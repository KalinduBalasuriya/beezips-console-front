@AGENTS.md

# Beezips ERP Frontend

Next.js App Router + TypeScript + Tailwind CSS. Internal ERP dashboard
(purchasing, production, sales & distribution, inventory) for a fruit juice
manufacturer.

## Responsive design — mandatory, not optional

This app must be mobile-first responsive. Every screen needs to work
correctly at a 375px-wide viewport, not just desktop. This applies to every
new component and every edit to an existing one — don't wait to be asked.

- Write Tailwind classes mobile-first: unprefixed utilities are the mobile
  baseline, use `sm:` / `md:` / `lg:` to progressively enhance for larger
  screens. Never design desktop-first and cram in mobile overrides after.
- The sidebar (`components/layout/Sidebar.tsx`) is currently a fixed
  256px-wide column with no mobile handling — this needs to collapse into
  an off-canvas drawer or bottom nav below the `lg` breakpoint.
- Any wide data table (sales list, raw materials, production log) needs a
  mobile treatment — horizontal scroll wrapper at minimum, or a
  card-per-row layout below `md` if scroll isn't good enough.
- Modals (`components/modals/Modal.tsx` and friends) should go full-screen
  on mobile instead of the fixed-width centered dialog they use now.
- `FlavorHoverCell.tsx` relies on `onMouseEnter`/`onMouseLeave`, which
  doesn't work on touch devices — mobile needs a tap-to-open fallback
  (e.g. tap toggles the tooltip, tap outside closes it), not just leaving
  it hover-only.
- Touch targets (buttons, nav items) should be at least 44px tall on
  mobile.
- Stat card / quick action grids should stack to a single column on
  mobile, not just shrink.

## Verification

After any UI change, check it at a mobile viewport width, not only
desktop. Don't consider a component done until it's been checked at both.
