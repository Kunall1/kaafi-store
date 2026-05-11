-- ─────────────────────────────────────────────────────────────────────────────
-- KAAFI — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- This script is idempotent — safe to re-run at any time.
-- It will NOT delete existing data.
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PROFILES
--    Auto-created when a user signs up via Supabase Auth.
--    Linked to auth.users via the trigger at the bottom of this file.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id          uuid        primary key references auth.users on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  created_at  timestamptz default now()
);

comment on table public.profiles is 'One profile per auth user, auto-created on sign-up.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. PRODUCTS
--    Stores all product info. Currently seeded with the 2 Founder's Drop tees.
--    Phase 3 will fetch from this table instead of the hardcoded PRODUCTS array.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.products (
  id          text        primary key,   -- e.g. 'crop-tee-black'
  name        text        not null,
  color       text        not null,
  color_hex   text,
  price       integer     not null,      -- in paise? no — in rupees (₹999)
  sizes       text[]      default '{}',
  description text,
  details     text[]      default '{}',
  images      text[]      default '{}',
  active      boolean     default true,
  created_at  timestamptz default now()
);

comment on table public.products is 'Product catalogue. active=false hides the product from the storefront.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ORDERS
--    One row per completed order. user_id can be null for guest checkouts
--    (we'll add guest support later if needed).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.orders (
  id                  uuid        primary key default gen_random_uuid(),
  order_number        text        unique not null,   -- e.g. 'KAAFI-ABC123'
  user_id             uuid        references auth.users,
  customer_name       text        not null,
  customer_email      text        not null,
  customer_phone      text        not null,
  shipping_address    text        not null,
  shipping_city       text        not null,
  shipping_pincode    text        not null,
  total               integer     not null,          -- in rupees
  payment_id          text,                          -- Razorpay payment ID
  razorpay_order_id   text,                          -- Razorpay order ID
  status              text        not null default 'pending'
                        check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at          timestamptz default now()
);

comment on table public.orders is 'One row per order. status progresses: pending → paid → shipped → delivered.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. ORDER ITEMS
--    Line items for each order. Denormalised (copies product_name, color, price)
--    so the order record is self-contained even if a product is deleted later.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.order_items (
  id            uuid    primary key default gen_random_uuid(),
  order_id      uuid    not null references public.orders on delete cascade,
  product_id    text    references public.products,
  product_name  text    not null,
  color         text,
  size          text    not null,
  qty           integer not null check (qty > 0),
  price         integer not null   -- price per unit at time of purchase
);

comment on table public.order_items is 'Line items. Prices are snapshotted at purchase time.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. INVENTORY
--    Stock levels per (product, size). Updated by admin / post-purchase.
--    Phase 6 (admin dashboard) will expose a UI to manage this.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.inventory (
  id          uuid    primary key default gen_random_uuid(),
  product_id  text    not null references public.products,
  size        text    not null,
  stock       integer not null default 0 check (stock >= 0),
  updated_at  timestamptz default now(),
  unique (product_id, size)
);

comment on table public.inventory is 'Stock per (product, size). stock=0 means sold out.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 6. ROW LEVEL SECURITY (RLS)
--    RLS is CRITICAL — without it, any user with your anon key can read/write
--    everyone's orders. Enable it on every table.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles   enable row level security;
alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory  enable row level security;


-- ── profiles ──────────────────────────────────────────────────────────────
-- Users can only see and edit their own profile.

drop policy if exists "profiles: select own"  on public.profiles;
drop policy if exists "profiles: update own"  on public.profiles;
drop policy if exists "profiles: insert own"  on public.profiles;

create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);


-- ── products ──────────────────────────────────────────────────────────────
-- Anyone (including unauthenticated visitors) can browse active products.
-- Only service_role (your backend) can insert/update/delete.

drop policy if exists "products: public read" on public.products;

create policy "products: public read"
  on public.products for select
  using (active = true);


-- ── orders ────────────────────────────────────────────────────────────────
-- Logged-in users can see only their own orders.
-- Insert is allowed when user_id matches or is null (guest, future use).

drop policy if exists "orders: select own"  on public.orders;
drop policy if exists "orders: insert own"  on public.orders;

create policy "orders: select own"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders: insert own"
  on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);


-- ── order_items ───────────────────────────────────────────────────────────
-- Users can see items that belong to their orders.

drop policy if exists "order_items: select own"  on public.order_items;
drop policy if exists "order_items: insert"      on public.order_items;

create policy "order_items: select own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- Allow insert from server-side (Vercel API route uses service_role key)
create policy "order_items: insert"
  on public.order_items for insert
  with check (true);


-- ── inventory ─────────────────────────────────────────────────────────────
-- Public can read stock levels (needed to show "sold out" on product pages).

drop policy if exists "inventory: public read" on public.inventory;

create policy "inventory: public read"
  on public.inventory for select
  using (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. TRIGGER — Auto-create profile on sign-up
--    When a new user registers, this trigger runs and inserts a matching row
--    in public.profiles so we have a safe place to store extra user data.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer               -- runs as the function owner, not the user
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'  -- set during signUp({ options: { data: { full_name } } })
  )
  on conflict (id) do nothing;  -- idempotent
  return new;
end;
$$;

-- Drop and recreate so this script is safe to re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════
-- 8. SEED DATA — Products
--    Two Founder's Drop tees. ON CONFLICT DO NOTHING means re-running is safe.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.products (id, name, color, color_hex, price, sizes, description, details, images)
values
  (
    'crop-tee-black',
    'Cropped Tee',
    'Black',
    '#111',
    999,
    ARRAY['S', 'M', 'L'],
    'Crafted with intention. A cropped silhouette that speaks through silence. Premium construction, built for everyday wear.',
    ARRAY['240 GSM french terry cotton', 'Premium stitching', 'Cropped relaxed fit', 'Ribbed crew neck', 'Made in India'],
    ARRAY[
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'
    ]
  ),
  (
    'crop-tee-white',
    'Cropped Tee',
    'White',
    '#F2F2F0',
    999,
    ARRAY['S', 'M', 'L'],
    'Crafted with intention. A cropped silhouette that speaks through silence. Premium construction, built for everyday wear.',
    ARRAY['240 GSM french terry cotton', 'Premium stitching', 'Cropped relaxed fit', 'Ribbed crew neck', 'Made in India'],
    ARRAY[
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80'
    ]
  )
on conflict (id) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════
-- 9. SEED DATA — Inventory
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.inventory (product_id, size, stock)
values
  ('crop-tee-black', 'S', 10),
  ('crop-tee-black', 'M', 10),
  ('crop-tee-black', 'L', 10),
  ('crop-tee-white', 'S', 10),
  ('crop-tee-white', 'M', 10),
  ('crop-tee-white', 'L', 10)
on conflict (product_id, size) do nothing;


-- ─────────────────────────────────────────────────────────────────────────────
-- Done! Tables created:
--   ✓ profiles      — user accounts
--   ✓ products      — product catalogue (seeded with 2 tees)
--   ✓ orders        — order records
--   ✓ order_items   — line items per order
--   ✓ inventory     — stock levels (seeded 10 per SKU)
--
-- RLS enabled on all tables. Trigger auto-creates profile on sign-up.
-- ─────────────────────────────────────────────────────────────────────────────
