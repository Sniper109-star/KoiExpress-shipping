# Active Context: KoiExpress USA / Unifet Logistics Platform

## Current State

Unifet logistics platform on Next.js 16. Supabase is the new target source of truth for auth and logistics data; legacy Neon/Drizzle and Better Auth routes remain and are being migrated incrementally.

## Supabase foundation completed

- Created Supabase enums for business roles, shipment lifecycle, document types, invoice status, and payment status.
- Created `profiles`, `businesses`, `business_members`, `customers`, `warehouses`, `addresses`, `orders`, `shipments`, `shipment_items`, `packages`, `shipping_rates`, `labels`, `tracking_events`, `drivers`, `vehicles`, `dispatches`, `invoices`, `payments`, `notifications`, and `shipment_documents` with foreign keys, unique constraints, indexes, and timestamps.
- Enabled RLS and added business-membership access policies plus child shipment policies.
- Added pinned security-definer membership helper, profile-on-signup trigger, and updated-at triggers.
- Read-only Supabase verification confirms all 20 requested public tables exist.

## Supabase runtime work completed

- Added `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, and `src/lib/supabase/proxy.ts` using `@supabase/ssr`.
- Added root Next 16 `proxy.ts` for session refresh.
- Migrated `GET` and `POST /api/shipments` to Supabase, creating addresses, shipment, package, item, and initial tracking event.
- Added `POST /api/shipments/quote` with deterministic internal mock carrier rates and `draft` → `quoted` transition.
- Added `/api/shipments/[shipmentId]/transition` for service selection, mock payment, label creation, lifecycle advancement, cancellation, and refunding.
- Added `/api/shipments/[shipmentId]/documents` for downloadable PDFs: shipping label, packing slip, commercial invoice, shipment receipt, and BOL.
- Added `ShipmentDocuments` download-link component.
- Rebuilt dashboard create-shipment workflow to use structured Supabase payloads, quote mock rates, and select a service.
- Installed `@supabase/ssr` and `@supabase/supabase-js`.

## Verification

- `npm run build` passes.
- `npm run lint` passes.
- `npx tsc --noEmit` passes.
- Browser verification passed for `/dashboard/create` at 411x576 dark mode; form renders with accessible labels and carrier quote entry point.
- Existing Better Auth emits default-secret warnings during static generation because legacy routes still import it; this is the remaining migration gap.

## Recent carrier adapter work

- Added `src/lib/shipping/` as Unifet-owned carrier boundary: normalized types/schemas, `CarrierAdapter`, rate/label/tracking services, and a clearly marked `CustomMockCarrier`.
- Added `/api/shipping/rates`, `/api/shipping/labels`, and normalized `/api/tracking/[trackingNumber]` routes. Existing `/api/shipments/rates` now routes through the same Unifet rate service.
- Karrio-compatible code remains an optional carrier implementation reference behind the service boundary; Supabase data models remain Unifet-owned.

## Complete mock shipment lifecycle

- Rebuilt the customer shipment form as a staged flow: validate addresses/package, create shipment in Supabase, request and persist normalized rates, select a service, confirm mock payment, create and persist the CustomMockCarrier test label, then open/download/print it.
- `/api/shipping/rates` now accepts a shipment ID and persists `shipping_rates`; `/api/shipping/labels` persists `labels`, updates shipment status/tracking, and records the initial tracking event.
- Tracking lookup reads persisted Supabase shipment events first, while the mock adapter remains a fallback. The shipment dashboard now displays reference, customer, route, service, price, status, label, and tracking data from Supabase.

## Verification

- `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass.
- Browser verification passed for `/create-shipment` at the current 411x576 dark viewport. The form renders the four lifecycle stages and accessible shipment/package fields.
- Build still reports existing Better Auth default-secret warnings from legacy routes; they are unrelated to the carrier lifecycle and remain a migration gap.

## Next implementation priorities

1. Migrate remaining auth/admin routes and login/register pages to Supabase Auth and remove Better Auth runtime dependency.
2. Add API/E2E coverage for authenticated shipment creation through delivery/refund and RLS isolation.
3. Run Supabase advisors/security checks after final policy refinements.

## Approved implementation update

- Added forward migration `005_unifet_foundation.sql` for businesses, business membership, quote/label persistence, ownership columns, indexes, RLS policies, membership authorization helper, timestamp trigger, and canonical transition validation.
- Hardened `POST/GET /api/shipments/[shipmentId]/transition` with UUID and JSON validation, terminal-state guards, server-side payment amount validation, idempotent mock payment/label writes, optimistic status updates, structured errors, and tracking-event persistence.
- Verification after changes: `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass. Supabase Authentication is now the client auth provider; the legacy Better Auth endpoint returns a migration response and no longer initializes Better Auth or requires `BETTER_AUTH_SECRET`.
- Carrier layer: `carrier.ts` is the Unifet contract, `carrier-registry.ts` selects adapters, and `CustomMockCarrier` provides deterministic, clearly test-labeled rates, labels, and tracking without Karrio runtime/database dependencies.
- API boundary: `/api/shipping/rates`, `/api/shipping/labels`, and `/api/tracking/[trackingNumber]` remain Unifet-owned and persist results to Supabase; Karrio is used only as an architectural reference.

## Stream and duplicate-route cleanup

- Root cause of the `validationLevel` runtime error was the legacy Drizzle/Better Auth implementation of `/api/shipments/stream`; it now uses Supabase auth, business membership, shipment polling, and tracking events exclusively.
- `/api/shipping/rates` and `/api/tracking/[trackingNumber]` are canonical. The older `/api/shipments/rates` and `/api/track/[trackingNumber]` paths are compatibility redirects only, with callers updated to canonical routes.
- Consolidated client SSE subscriptions through `src/lib/realtime.ts`, fixed effect/purity lint failures, and excluded stale `.next/dev` types from TypeScript input. `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass; browser verification of the home page passed at 411x630 dark mode.

## End-to-end shipment workflow

- Applied the live Supabase schema for the shipment flow, including addresses, packages, payments, shipment documents, provider metadata, lifecycle timestamps, RLS, and idempotent tracking-event support.
- `/api/shipments` persists addresses, package dimensions/weight, items, shipment, and initial event; `/api/shipping/rates` persists comparison rates and moves the shipment to `quoted`; service selection and mock payment remain guarded transitions.
- `/api/shipping/labels` is idempotent, persists the selected carrier/service and tracking number, and returns a printable/downloadable PDF URL through the Supabase-backed document route.
- Lifecycle transitions now enforce creator ownership, terminal states, cancellation restrictions, optimistic status updates, and tracking timeline writes. The customer form exposes cancellation and clear error/status messaging.
- The application remains adapter-based: replace `CustomMockCarrier` in the carrier registry with `RealCarrierAdapter` while retaining the UI and normalized API contracts.
- Verification: Supabase migrations succeeded; `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass; `/create-shipment` was browser-verified at 411x630 dark mode.
- Follow-up hardening: shipment creation now validates both addresses through the registered Unifet adapter, returns idempotent existing shipments for retries, verifies package/item/event persistence, and rolls back the shipment if child persistence fails. The shipment events route now uses Supabase with creator ownership checks instead of retired Drizzle tables; the form sends a stable idempotency key.
- Auth verification fix: `/login` was previously a static, non-submitting form and the root layout did not mount `Providers`, so Supabase Auth could not be used by the browser. Login now calls `signIn`, shows pending/errors, redirects to `/create-shipment`, and the root layout mounts `Providers` for persistent client auth state.
- Validation: unauthenticated shipment creation returns 401; `/login` renders and hydrates in the browser; typecheck/lint pass; production build passes when run with `/vercel/share/.env.project` loaded. A real shipment submission still requires the user’s test account credentials.
- Build fix: removed `output: "standalone"` from `next.config.ts`. Vercel’s Next build packaging was looking for the standalone trace artifact `/vercel/path0/.next/next-server.js.nft.json`, which was not generated in the failing deployment path. The standard Vercel Next output builds successfully locally with Next 16.3.1.
- Tracking/map branding: `/track` now presents a branded `UNIFET / TRACKING CONTROL` surface with shipment-search treatment, `UNIFET ROUTE VIEW`, and `LIVE SHIPMENT MAP` sections. It passes origin, latest persisted event coordinates, destination, route, and `branded` markers into the existing MapLibre/MapTiler component. `MAPTILER_API_KEY` remains server-side through the existing style/proxy routes and is not stored in Supabase. Lint, typecheck, and production build pass; browser verification shows MapTiler rendering successfully at the current 411x630 dark viewport.
- Tracking polish: improved shipment identity/status/last-updated hierarchy, responsive map height, loading skeleton, map accessibility label, and branded status/timeline treatment on `/track`. `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass; browser screenshot verified the polished empty tracking state with live MapTiler rendering.
- MapTiler custom style: the server-side `/api/maptiler/style` route now fetches style ID `01a0050e-b9d9-78e5-a753-e11bde9db174` instead of the default streets style. `MAPTILER_API_KEY` remains server-only, URL assets are rewritten through the existing proxy, and the custom style returns HTTP 200 and renders in the browser without console errors. Typecheck, lint, and production build pass.
- Supabase Realtime: `src/lib/realtime.ts` now creates a browser Supabase channel and subscribes to `postgres_changes` for `shipments` and `tracking_events`. `subscribeToShipment` listens to both tables filtered by shipment ID, so tracking reloads shipment data and coordinates when status or tracking events change without a page refresh. Existing SSE fallback remains for notifications/legacy consumers. Typecheck, lint, build, and browser hydration pass; a live row mutation still needs a real shipment/user context to exercise end to end.
- Live tracking MVP: added coordinate columns and indexes to `shipments`/`tracking_events`, enabled both tables in `supabase_realtime`, added the server-only Supabase admin client for public tracking reads, and made `/api/tracking/[trackingNumber]` return shipment coordinates, current location, ETA, and ordered events. Added `/track/[trackingNumber]` compatibility route, dashboard `MOCK CARRIER CONTROL` buttons, and an authenticated `/api/mock/simulate/[shipmentId]` sequence for picked up → in transit checkpoints A/B/C → out for delivery → delivered. Current map prefers persisted `current_latitude/current_longitude`; schema is recorded in migration `006_tracking_realtime_coordinates.sql`. Typecheck, lint, production build, public not-found tracking, simulator auth guard, dashboard render, and Realtime publication verification pass. A successful live movement run still requires an authenticated user with an active shipment containing an ID and coordinates.
- Live tracking completion pass: `/track/[trackingNumber]` now renders the tracking experience directly while preserving `/track?tracking=...`. Dashboard mock controls can manually advance or run every 5 seconds, stopping at Delivered. Typecheck, lint, build, canonical URL browser verification, and MapTiler rendering pass. The supplied `UNF784923105` record is not present in Supabase, so a successful live movement test still requires a seeded active shipment and authenticated dashboard session.
- Self-sufficient development tracking flow: added authenticated development-only `POST /api/dev/test-shipment`, which creates a real business-owned shipment with generated `UNF#########` tracking number, NYC/Boston coordinates, ETA, initial label-created event, and a returned `/track/[trackingNumber]` URL. Dashboard exposes `Create test shipment` and opens the generated public tracking page; public tracking API returns only the minimum shipment/event fields needed for customer tracking. The mock simulator now advances the full lifecycle from label-created through picked-up, in-transit, out-for-delivery, and delivered, updating coordinates and ETA on each Supabase write; it remains dashboard-authenticated and production-disabled. Unauthenticated test endpoint returns 401; typecheck, lint, production build, and browser tracking-route verification pass.
