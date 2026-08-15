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

## Next implementation priorities

1. Migrate remaining auth/admin routes and login/register pages to Supabase Auth and remove Better Auth runtime dependency.
2. Connect shipment detail/list screens to the new Supabase lifecycle and document endpoints.
3. Persist new adapter label/tracking results into Supabase shipment tables from the lifecycle endpoints.
4. Add API/E2E tests for authenticated shipment creation through delivery/refund and RLS isolation.
5. Run Supabase advisors/security checks after final policy refinements.
