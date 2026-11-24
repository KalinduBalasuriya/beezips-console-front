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

## State management — Redux Toolkit

Use Redux Toolkit (`@reduxjs/toolkit` + `react-redux`) for app state, and
reach for each of its features where it fits — don't fall back to ad-hoc
`useEffect` + `fetch` or prop drilling:

- **RTK Query** for server data (GET lists/details, POST/PUT/DELETE). One
  `createApi` in `store/api/baseApi.ts`; each feature adds endpoints with
  `injectEndpoints` in its own `store/api/<feature>Api.ts`. Use
  `providesTags` / `invalidatesTags` so saves refresh stale data.
- **`createAsyncThunk`** for async flows that are more than one request:
  several API calls in sequence, reading `getState()` mid-flow, or
  coordinating a request with slice updates. Handle `pending` / `fulfilled`
  / `rejected` in the slice's `extraReducers`.
- **`createSlice`** in `store/slices/<feature>Slice.ts` for client state
  shared across components or pages (filters, selected period, UI
  preferences, multi-step drafts). Register every reducer in
  `store/store.ts`.
- **Selectors**: read state with `useAppSelector`; use `createSelector`
  for derived/computed values. Dispatch with `useAppDispatch`. Always use
  the typed hooks in `store/hooks.ts`, never plain `useSelector` /
  `useDispatch`.
- Don't duplicate API data into a slice — RTK Query's cache is the single
  source of truth for it. State used by one component only stays in
  `useState`.
- API wire types live in `lib/api/types.ts`; turn API errors into
  user-facing messages with `getApiErrorMessages` (`lib/api/errors.ts`).

## Verification

After any UI change, check it at a mobile viewport width, not only
desktop. Don't consider a component done until it's been checked at both.
