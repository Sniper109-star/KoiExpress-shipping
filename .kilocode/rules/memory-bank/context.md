# Active Context: KoiExpress Logistics Platform

## Current State

**App Status**: Rebranded logistics platform with KoiExpress theme (Next.js 16 + Tailwind v4)

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