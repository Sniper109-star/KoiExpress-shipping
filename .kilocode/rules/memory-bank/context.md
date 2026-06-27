# Active Context: SwiftShip Logistics Platform

## Current State

**App Status**: Production-ready logistics platform with Supabase integration and Mapbox GL JS maps

## Recently Completed

- [x] Supabase configuration and client setup
- [x] Complete PostgreSQL schema with all tables (users, profiles, drivers, customers, shipments, tracking_events, vehicles, warehouses, payments, invoices, addresses, reviews, notifications, wallets, transactions, audit_logs, support_tickets, settings, media)
- [x] Row Level Security policies for all roles
- [x] Authentication with Supabase Auth
- [x] Shadcn/UI components (button, card, input, label, table, select)
- [x] React Hook Form with Zod validation
- [x] TanStack Query integration
- [x] Frontend pages (home, login, register, track, create-shipment, dashboard, admin, driver)
- [x] Mobile-first responsive UI/UX upgrade (hamburger nav, touch-friendly forms, responsive grids)
- [x] Mapbox GL JS integration for real-time tracking and route visualization

## Current Structure

| Directory/File | Description |
|----------------|-------------|
| `src/app/` | Next.js pages |
| `src/components/ui/` | UI components |
| `src/components/navbar.tsx` | Mobile-responsive navigation |
| `src/components/map.tsx` | Mapbox GL JS map component |
| `src/contexts/auth-context.tsx` | Auth context |
| `src/lib/supabase.ts` | Supabase client |
| `src/lib/supabase-types.ts` | Type definitions |
| `supabase/migrations/` | SQL migrations |
| `Dockerfile` | Docker configuration |
| `.github/workflows/ci.yml` | CI/CD pipeline |

## Features Implemented

1. **Authentication**: Email/password, OAuth providers, role-based access
2. **Shipment Management**: Create, track, assign shipments
3. **Driver Management**: Vehicle info, availability, earnings
4. **Customer Management**: Profiles, addresses, wallet balance
5. **Realtime Tracking**: GPS coordinates, status updates
6. **Payments**: Stripe integration ready
7. **Notifications**: In-app notification system
8. **Maps**: Mapbox GL JS for delivery tracking, driver routes, and location markers

## Next Steps

- Add email service (Resend)
- Add payment webhooks
- Add storage for images/documents