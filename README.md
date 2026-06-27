# SwiftShip Logistics Platform

A production-ready full-stack logistics and delivery management platform built with Supabase.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **UI**: Shadcn/UI components
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod

## Features

### Authentication
- Email/password signup and login
- OAuth providers (Google, GitHub, Apple)
- Magic links and OTP
- Password reset
- Role-based access control (customer, driver, dispatcher, warehouse_staff, admin, super_admin)

### Shipment Management
- Create shipments with pickup/delivery addresses
- Multiple shipment types (standard, same-day, international, freight)
- Real-time tracking with GPS coordinates
- QR codes and barcodes
- Scheduled and multi-stop deliveries

### Dashboards
- Customer dashboard for viewing shipments
- Driver dashboard for managing deliveries
- Admin dashboard with analytics and management

### Database
- PostgreSQL with complete schema for logistics operations
- Row Level Security (RLS) policies
- Automatic triggers for audit logging and notifications

## Setup

1. Clone the repository
2. Create a Supabase project at supabase.com
3. Copy `.env.example` to `.env.local` and fill in values
4. Run migrations in Supabase SQL editor
5. `bun install`
6. `bun run dev`

## Project Structure

```
src/
  app/
    login/          # Authentication pages
    register/       # Registration pages
    track/          # Package tracking
    create-shipment/ # Shipment creation
    dashboard/      # Customer dashboard
    admin/          # Admin dashboard
    driver/         # Driver dashboard
  components/
    ui/             # Shadcn/UI components
  contexts/
    auth-context.tsx  # Auth provider
  lib/
    supabase.ts     # Supabase client
supabase/
  migrations/       # SQL migrations
```

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server only)

Optional:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Maps integration
- `STRIPE_SECRET_KEY` - Payments
- `RESEND_API_KEY` - Email service

## Deployment

Deploy to Vercel or any platform supporting Next.js. Ensure environment variables are set.