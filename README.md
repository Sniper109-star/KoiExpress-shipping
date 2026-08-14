# Unifet Logistics Platform

A full-stack logistics and delivery management platform built with Next.js, Neon Postgres, Better Auth, and private Vercel Blob storage.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Neon Postgres + Drizzle ORM + Better Auth
- **Storage**: Private Vercel Blob for labels, PDFs, and shipment documents
- **Maps**: MapTiler through server-side proxy routes
- **Messaging**: Resend email and Smartsupp support widget
- **GPS**: Damoov trip and tracking API
- **UI**: Shadcn/UI components

## Features

- Email/password authentication with role-based access control
- Customer, shipment, address, tracking event, invoice, document, and notification records
- Shipment dashboards with Neon-backed polling for live updates
- Private document upload and authenticated delivery
- MapTiler maps and geocoding without exposing the API key
- Resend shipment notifications and contact email delivery
- Damoov GPS trip integration
- Hidden, signed admin session access

## Environment Variables

Required integrations:
- `DATABASE_URL` - Neon Postgres connection
- `BETTER_AUTH_SECRET` - at least 32 random characters
- `DAMOOV_JWT` - Damoov server credential
- `MAPTILER_API_KEY` - MapTiler server credential
- `BLOB_READ_WRITE_TOKEN` - private Vercel Blob storage
- `RESEND_API_KEY` - Resend server credential
- `NEXT_PUBLIC_SMARTSUPP_KEY` - Smartsupp browser widget key
- `EMAIL` and `PASSWORD` - admin login credentials

Never expose server credentials through `NEXT_PUBLIC_*` variables. Deploy to Vercel or another platform supporting Next.js and ensure the variables are configured there.
