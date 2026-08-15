# Active Context: KoiExpress USA - Global Logistics Platform

## Current State

**App Status**: Unifet logistics platform with live Neon shipment, event, customer, driver, and quote schema (Next.js 16 + Tailwind v4)

## Recently Completed

- [x] KoiExpress rebranding (brand colors, fonts, logos across all pages)
- [x] Tailwind v4 @theme configuration with KoiExpress brand colors (primary/secondary/success/dark/accent)
- [x] Enhanced UI components: Button (primary/secondary/success variants), Card (variants), Table (themed)
- [x] New Modal component (portal-based with backdrop-blur overlay)
- [x] Dashboard layout system (Sidebar + Header + DashboardLayout)
- [x] Homepage components: HeroSection, FeaturesSection, MapPreviewSection, TestimonialsSection, Footer, LandingPage
- [x] Dashboard pages: Overview, Shipments (filters + table), Create Shipment (form + map), Drivers (table + ratings), Settings (profile/notifications/theme), Tracking (map + driver card)
- [x] Updated existing pages (login, register, track, create-shipment) to KoiExpress branding
- [x] Inter font import via Google Fonts in layout.tsx
- [x] Full Next.js build verified (16 routes compiled successfully)
- [x] Editorial red-and-milk visual system applied across shared shells, public/auth surfaces, and dashboard primitives
- [x] Responsive homepage preview verified at 508x800 with browser screenshot
- [x] Rebranded product to Unifet with navy and orange semantic design tokens
- [x] Added Neon logistics schema with RLS policies, shipment events, quotes, customers, drivers, indexes, and Realtime publication tables
- [x] Rebuilt homepage with Unifet hero, services, journey, tracking, benefits, quote calculator, and about sections
- [x] Added public tracking lookup with shipment Realtime subscription and persisted quote requests
- [x] Typecheck, lint, production build, and mobile browser verification passed
- [x] Switched Unifet from navy/orange to an exclusive red-and-milk palette
- [x] Generated and added premium delivery van, freight truck, and cargo aircraft imagery to the homepage fleet showcase
- [x] Optimized fleet imagery with next/image and verified the red-and-milk homepage in the browser
- [x] Added Resend contact/support and shipment notification API routes using `process.env.RESEND_API_KEY`
- [x] Replaced the temporary realtime layer with Neon Realtime shipment and tracking event subscriptions
- [x] Added OpenFreeMap Liberty MapLibre tracking maps with safe popup content and live event markers
- [x] Reused the shared Neon client for auth and added the email callback redirect
- [x] Typecheck, lint, production build, and desktop browser verification passed
- [x] Added uploaded KoiExpress emblem as the shared public and admin brand logo
- [x] Built Neon-backed admin login, protected middleware, dashboard, orders, customers, and admin API routes
- [x] Added admin signout route and verified typecheck, lint, and production build
- [x] Updated product positioning from regional logistics to KoiExpress USA - Global
- [x] Removed stale Unifet, fish-icon, and Lagos/London identity references across public and authenticated surfaces
- [x] Updated metadata, auth pages, shipment tracking, footer, sidebar, and homepage messaging for worldwide coverage
- [x] Verified typecheck, lint, production build, and homepage browser rendering
- [x] Audited Neon environment usage, client/server auth wiring, shipment query types, and realtime subscriptions
- [x] Added missing Neon profiles and quotes tables, RLS policies, grants, and realtime publication entries
- [x] Fixed all stale shipment field references and realtime callback typing errors
- [x] Re-ran typecheck, lint, environment-aware production build, and browser smoke test successfully
- [x] Replaced the platform logo asset with the supplied red, gold, and navy ship emblem
- [x] Fixed build-time Neon configuration failure with a guarded client fallback and runtime validation
- [x] Re-ran typecheck, lint, production build, and homepage browser verification successfully
- [x] Replaced dashboard and shipments mock data with live Neon shipment queries
- [x] Added reusable Neon Realtime subscriptions for shipments, tracking events, and notifications
- [x] Connected dashboard tracking to live shipment and tracking-event refreshes
- [x] Fixed Next.js tracking search-param prerendering with Suspense
- [x] Verified typecheck, lint, production build, and realtime dashboard/tracking browser routes
- [x] Added server-only TrackingMore create-tracking route at `/api/trackingmore/create`
- [x] Added server-only TrackingMore lookup route at `/api/trackingmore/track`
- [x] Configured `TRACKINGMORE_API_KEY` as a project environment variable without exposing it to the browser
- [x] Verified TrackingMore integration with typecheck, lint, and production build
- [x] Confirmed live shipments, tracking_events, quotes, and profiles tables; added missing notifications table
- [x] Confirmed shipments, tracking_events, and notifications are registered in Neon Realtime
- [x] Added reproducible `004_realtime_notifications.sql` migration with RLS and grants
- [x] Added Resend configuration dry-run support and verified it returns configured successfully without sending mail
- [x] Verified SmartSupp loads in the browser and public tracking UI renders end to end
- [x] Fixed corrupted Next.js generated validator output; typecheck, lint, and production build now pass
- [x] Hardened public tracking with normalized lookup, validation, shareable tracking URLs, and initial auto-load
- [x] Added Suspense boundary for tracking search params and improved TrackingMore no-store/error responses
- [x] Verified tracking page browser flow, TrackingMore validation responses, typecheck, lint, and production build
- [x] Confirmed `TRACKINGMORE_API_KEY` is configured server-side
- [x] Replaced static admin cookie with signed HttpOnly admin sessions based on `EMAIL` and `PASSWORD`
- [x] Added protected admin shipment management PATCH API using the Neon service role server-side
- [x] Fixed admin login redirect loop and verified valid login, unauthorized rejection, protected API access, build, lint, and typecheck
- [x] Added branded homepage live shipment feed backed by Neon shipments and realtime updates
- [x] Added company email `Vicities56@gmail.com` to the homepage footer and contact routing fallback
- [x] Verified homepage browser rendering, Resend dry-run, typecheck, lint, and production build
- [x] Connected Neon and validated the logistics schema through Neon MCP with one-statement-at-a-time DDL
- [x] Added Neon compatibility columns for the existing Drizzle query layer
- [x] Fixed MapTiler and Damoov routes to use `MAPTILER_API_KEY` and `DAMOOV_JWT`
- [x] Hardened signed admin sessions to use `EMAIL` and `PASSWORD`
- [x] Added private Vercel Blob upload and authenticated document delivery routes
- [x] Installed `@vercel/blob` 2.x and passed typecheck and lint
- [x] Verified the public homepage in the browser at desktop dark mode
- [x] Removed public demo tracking hint and added accessible custom Smartsupp support button
- [x] Added admin credential configuration validation; current project values contain literal `process.env` text and must be replaced with actual secret values before login can succeed
- [x] Added Neon shipping-engine tables, Drizzle models, user-scoped rate calculation, label purchase, tracking, cancellation, and idempotent webhook routes
- [x] Wired the customer shipment form to the Neon shipping-engine rate and label workflow with parcel validation, carrier comparison, label download, and print actions
- [x] Verified shipping-engine typecheck, lint, production build, Neon tables, and dashboard/create browser rendering
- [x] Added MapTiler address autocomplete with server-side geocoding, shipment coordinate capture, live landing-page route map, and browser-verified map frontend integration

## Integration Notes

Neon is the relational backend for shipment data, customers, addresses, tracking events, invoices, documents, notifications, and Better Auth sessions. Vercel Blob private storage is used for shipment labels, PDFs, and documents; private files are served through authenticated delivery routes. Dashboard live updates use Neon-backed server APIs with SSE rather than Neon Realtime; the public landing tracker subscribes to the same stream after lookup. Tracking event history is exposed through `/api/shipments/[shipmentId]/events`, merging legacy and shipping-engine events. MapTiler is accessed through server-side proxy routes with `MAPTILER_API_KEY`; Resend, Smartsupp, and Damoov credentials remain server-side.

The Neon schema was validated and created incrementally through Neon MCP, including profiles, customers, addresses, shipments, tracking_events, shipment_documents, invoices, and notifications. Compatibility columns were added to align the live tables with the existing Drizzle query layer.

## Current Structure

| Directory/File | Description |
|----------------|-------------|
| `src/app/globals.css` | Tailwind v4 UNIFET theme |
| `src/app/layout.tsx` | Root layout with Inter font |
| `src/components/ui/` | Enhanced UI components (card, button, table, modal, input, label, select) |
| `src/components/layouts/` | Sidebar, DashboardHeader, DashboardLayout |
| `src/components/home/` | HeroSection, FeaturesSection, MapPreviewSection, TestimonialsSection, Footer, LandingPage |
| `src/app/dashboard/` | Dashboard pages with layout wrapper |
| `src/components/navbar.tsx` | UNIFET public navigation

- [x] Rebranded active product UI, auth pages, support sender, testimonials, feature copy, navigation, metadata, and shipment entry points to UNIFET; replaced KoiExpress references and verified homepage branding in browser
- [x] Production upgrade: replaced landing tracking polling with Neon SSE, added merged tracking-events API, hardened MapTiler missing-image handling, added security headers, cancelled stale geocoding requests, and validated typecheck/lint/build/browser homepage
- [x] Connected MapTiler live preview to Neon shipment coordinates and SSE updates; added `/api/driver/location` for authenticated GPS event ingestion and exposed latest tracking event coordinates in live shipment responses
- [x] Added Neon Traccar tables (`traccar_devices`, `traccar_positions`, `traccar_tracking_links`), server-only Traccar REST sync using `API_2`/`API_KEY`, authenticated `/api/traccar/live`, and a live fleet panel on the authenticated dashboard
- [x] Platform upgrade: fixed MapTiler directions failures to return safe direct-route fallback data, added resilient live-map update timing, hardened dashboard shipment loading with retry and empty states, and verified homepage browser flow plus typecheck/lint/build
- [x] Release cleanup: corrected the env template, aligned CI with npm/package-lock, removed stale Supabase deployment assumptions from CI and Docker Compose, fixed Docker standalone build portability, and verified typecheck/lint/build
- [x] Added secure GitHub repository replication: authenticated dashboard panel, strict HTTPS GitHub URL validation, async job status API, `execFile`-based mirror worker with timeout/output limits/cleanup, and secure replication documentation

## Features Implemented

1. **Public Homepage**: Hero CTAs, feature cards, map preview, testimonials, footer
2. **Dashboard**: Stats cards, recent shipments table, sidebar navigation
3. **Shipments**: Filterable table with status badges
4. **Create Shipment**: Form with service type + map preview
5. **Drivers**: Table with ratings, vehicle info, availability badges
6. **Settings**: Profile form, notification toggles, theme toggle
7. **Tracking**: Map placeholder, driver info card, status display
