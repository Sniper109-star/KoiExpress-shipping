-- Unifet forward-compatible foundation. This migration supplements the legacy schema
-- without rewriting applied migrations. Run through the Supabase SQL/MCP workflow.

create extension if not exists pgcrypto;

DO $$ BEGIN
  CREATE TYPE public.business_role AS ENUM ('owner','admin','dispatcher','warehouse_staff','driver','billing');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.unifet_shipment_status AS ENUM ('draft','quoted','service_selected','payment_pending','paid','label_created','picked_up','in_transit','out_for_delivery','delivered','delayed','exception','cancelled','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (length(trim(name)) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.business_role not null default 'dispatcher',
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

-- Add business ownership to legacy operational tables where absent.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['customers','warehouses','addresses','shipments','drivers','vehicles','invoices','payments','notifications'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t AND column_name='business_id'
    ) THEN
      EXECUTE format('alter table public.%I add column business_id uuid references public.businesses(id) on delete cascade', t);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.shipments') IS NOT NULL THEN
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS reference_number text;
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS created_by uuid references auth.users(id);
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS idempotency_key text;
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS quoted_amount numeric(12,2);
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS shipping_cost numeric(12,2);
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS currency text not null default 'USD';
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS carrier_code text;
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS carrier_name text;
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS service_code text;
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS service_name text;
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS paid_at timestamptz;
    ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
  END IF;
END $$;

create table if not exists public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  carrier_code text not null,
  carrier_name text not null,
  service_code text not null,
  service_name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD' check (length(currency)=3),
  estimated_days integer not null check (estimated_days > 0),
  source text not null default 'mock' check (source in ('mock','carrier')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (shipment_id, carrier_code, service_code)
);

create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  package_id uuid references public.packages(id) on delete set null,
  tracking_number text not null unique,
  carrier_code text not null,
  service_code text not null,
  format text not null default 'PDF' check (format in ('PDF','ZPL')),
  document_url text,
  barcode_value text,
  qr_payload text,
  source text not null default 'mock' check (source in ('mock','carrier')),
  created_at timestamptz not null default now()
);

create index if not exists idx_shipments_business_created on public.shipments (business_id, created_at desc);
create unique index if not exists uq_shipments_business_idempotency on public.shipments (business_id, idempotency_key) where idempotency_key is not null;
create index if not exists idx_rates_shipment on public.shipping_rates(shipment_id);
create index if not exists idx_labels_shipment on public.labels(shipment_id);

create or replace function public.is_business_member(target_business_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.business_members bm where bm.business_id = target_business_id and bm.user_id = (select auth.uid()));
$$;
revoke all on function public.is_business_member(uuid) from public;
grant execute on function public.is_business_member(uuid) to authenticated;

-- RLS is enabled on every Unifet table. Existing policies are preserved.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['businesses','business_members','shipping_rates','labels'] LOOP
    EXECUTE format('alter table public.%I enable row level security', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS businesses_member_select ON public.businesses;
CREATE POLICY businesses_member_select ON public.businesses FOR SELECT TO authenticated USING (public.is_business_member(id) OR owner_id = (select auth.uid()));
DROP POLICY IF EXISTS business_members_member_select ON public.business_members;
CREATE POLICY business_members_member_select ON public.business_members FOR SELECT TO authenticated USING (public.is_business_member(business_id) OR user_id = (select auth.uid()));
DROP POLICY IF EXISTS shipping_rates_member_access ON public.shipping_rates;
CREATE POLICY shipping_rates_member_access ON public.shipping_rates FOR ALL TO authenticated USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
DROP POLICY IF EXISTS labels_member_access ON public.labels;
CREATE POLICY labels_member_access ON public.labels FOR ALL TO authenticated USING (exists (select 1 from public.shipments s where s.id=shipment_id and public.is_business_member(s.business_id))) WITH CHECK (exists (select 1 from public.shipments s where s.id=shipment_id and public.is_business_member(s.business_id)));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
DROP TRIGGER IF EXISTS businesses_touch_updated_at ON public.businesses;
CREATE TRIGGER businesses_touch_updated_at before update on public.businesses for each row execute function public.touch_updated_at();

COMMENT ON SCHEMA public IS 'Unifet-owned logistics foundation; carrier, payment, and label integrations remain explicit adapters.';
COMMENT ON TABLE public.shipping_rates IS 'Quotes are persisted and marked mock until a real carrier adapter is configured.';
COMMENT ON TABLE public.labels IS 'Labels are persisted; source=mock means no external carrier label was purchased.';

-- Optional transition RPC for server-side callers. It only permits the canonical path
-- and exception branches; clients should still call authenticated route handlers.
create or replace function public.allowed_shipment_transition(current text, target text)
returns boolean language sql immutable as $$
select (current,target) in (
 ('draft','quoted'),('quoted','service_selected'),('service_selected','payment_pending'),('service_selected','paid'),('payment_pending','paid'),('paid','label_created'),('label_created','picked_up'),('picked_up','in_transit'),('in_transit','out_for_delivery'),('out_for_delivery','delivered'),
 ('draft','cancelled'),('quoted','cancelled'),('service_selected','cancelled'),('payment_pending','cancelled'),('paid','refunded'),('label_created','delayed'),('picked_up','delayed'),('in_transit','delayed'),('out_for_delivery','delayed'),('label_created','exception'),('picked_up','exception'),('in_transit','exception'),('out_for_delivery','exception')
); $$;
revoke all on function public.allowed_shipment_transition(text,text) from public;
grant execute on function public.allowed_shipment_transition(text,text) to authenticated;

-- Verification queries:
-- select table_name from information_schema.tables where table_schema='public' order by table_name;
-- select * from pg_policies where schemaname='public';
-- select public.allowed_shipment_transition('paid','label_created');
