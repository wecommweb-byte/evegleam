-- Eve Gleam — Supabase product mirror schema.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → Run).

create table if not exists public.products (
  id                bigint primary key,          -- WooCommerce product ID
  name              text,
  slug              text,
  description       text,
  short_description text,
  price             numeric,
  regular_price     numeric,
  sale_price        numeric,
  stock_status      text,
  stock_quantity    integer,
  featured          boolean default false,
  total_sales       integer default 0,
  date_created      timestamptz,
  category_ids      integer[] default '{}',
  images            jsonb default '[]'::jsonb,
  categories        jsonb default '[]'::jsonb,
  tags              jsonb default '[]'::jsonb,   -- required by the bundle builder (filters on tags[].slug)
  updated_at        timestamptz default now()
);

create index if not exists products_slug_idx         on public.products (slug);
create index if not exists products_stock_status_idx on public.products (stock_status);
create index if not exists products_category_ids_idx on public.products using gin (category_ids);

-- Keep Row Level Security ON with NO public policies.
-- All reads/writes happen server-side with the service-role key, which bypasses RLS.
alter table public.products enable row level security;
