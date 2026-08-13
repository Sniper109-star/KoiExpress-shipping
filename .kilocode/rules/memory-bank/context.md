# Active Context: KoiExpress USA - Global Logistics Platform

## Current State

**App Status**: Unifet logistics platform with live Supabase shipment, event, customer, driver, and quote schema (Next.js 16 + Tailwind v4)

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
- [x] Added Supabase logistics schema with RLS policies, shipment events, quotes, customers, drivers, indexes, and Realtime publication tables
- [x] Rebuilt homepage with Unifet hero, services, journey, tracking, benefits, quote calculator, and about sections
- [x] Added public tracking lookup with shipment Realtime subscription and persisted quote requests
- [x] Typecheck, lint, production build, and mobile browser verification passed
- [x] Switched Unifet from navy/orange to an exclusive red-and-milk palette
- [x] Generated and added premium delivery van, freight truck, and cargo aircraft imagery to the homepage fleet showcase
- [x] Optimized fleet imagery with next/image and verified the red-and-milk homepage in the browser
- [x] Added Resend contact/support and shipment notification API routes using `process.env.RESEND_API_KEY`
- [x] Replaced the temporary realtime layer with Supabase Realtime shipment and tracking event subscriptions
- [x] Added OpenFreeMap Liberty MapLibre tracking maps with safe popup content and live event markers
- [x] Reused the shared Supabase client for auth and added the email callback redirect
- [x] Typecheck, lint, production build, and desktop browser verification passed
- [x] Added uploaded KoiExpress emblem as the shared public and admin brand logo
- [x] Built Supabase-backed admin login, protected middleware, dashboard, orders, customers, and admin API routes
- [x] Added admin signout route and verified typecheck, lint, and production build
- [x] Updated product positioning from regional logistics to KoiExpress USA - Global
- [x] Removed stale Unifet, fish-icon, and Lagos/London identity references across public and authenticated surfaces
- [x] Updated metadata, auth pages, shipment tracking, footer, sidebar, and homepage messaging for worldwide coverage
- [x] Verified typecheck, lint, production build, and homepage browser rendering

## Integration Notes

Supabase is the only backend for shipment data and realtime updates. Public tracking reads shipment and tracking event rows, while authenticated write policies scope changes to the owning user.

## Current Structure

| Directory/File | Description |
|----------------|-------------|
| `src/app/globals.css` | Tailwind v4 KoiExpress theme |
| `src/app/layout.tsx` | Root layout with Inter font |
| `src/components/ui/` | Enhanced UI components (card, button, table, modal, input, label, select) |
| `src/components/layouts/` | Sidebar, DashboardHeader, DashboardLayout |
| `src/components/home/` | HeroSection, FeaturesSection, MapPreviewSection, TestimonialsSection, Footer, LandingPage |
| `src/app/dashboard/` | Dashboard pages with layout wrapper |
| `src/components/navbar.tsx` | KoiExpress public navigation |

## Features Implemented

1. **Public Homepage**: Hero CTAs, feature cards, map preview, testimonials, footer
2. **Dashboard**: Stats cards, recent shipments table, sidebar navigation
3. **Shipments**: Filterable table with status badges
4. **Create Shipment**: Form with service type + map preview
5. **Drivers**: Table with ratings, vehicle info, availability badges
6. **Settings**: Profile form, notification toggles, theme toggle
7. **Tracking**: Map placeholder, driver info card, status display
