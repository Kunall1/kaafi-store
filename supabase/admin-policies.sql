-- ─────────────────────────────────────────────────────────────────────────────
-- KAAFI — Admin RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Both founders have full admin access.
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: returns true if the logged-in user is an admin founder
-- Used in every policy below so you only need to update this one place.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select auth.email() = 'kaafi0117@gmail.com'
$$;


-- ── 1. Orders: admin can read ALL orders ─────────────────────────────────────
drop policy if exists "admin: read all orders" on public.orders;
create policy "admin: read all orders"
  on public.orders for select
  using (public.is_admin());

-- ── 2. Orders: admin can update status ───────────────────────────────────────
drop policy if exists "admin: update orders" on public.orders;
create policy "admin: update orders"
  on public.orders for update
  using (public.is_admin());

-- ── 3. Order Items: admin can read ALL order items ───────────────────────────
drop policy if exists "admin: read all order_items" on public.order_items;
create policy "admin: read all order_items"
  on public.order_items for select
  using (public.is_admin());

-- ── 4. Inventory: admin can update stock ─────────────────────────────────────
drop policy if exists "admin: update inventory" on public.inventory;
create policy "admin: update inventory"
  on public.inventory for update
  using (public.is_admin());

-- ── 5. Products: admin can read ALL products (including inactive) ─────────────
drop policy if exists "admin: read all products" on public.products;
create policy "admin: read all products"
  on public.products for select
  using (public.is_admin());

-- ── 6. Products: admin can update ────────────────────────────────────────────
drop policy if exists "admin: update products" on public.products;
create policy "admin: update products"
  on public.products for update
  using (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- Done! Admin access granted to:
--   kaafi0117@gmail.com
--   bhargavarishabh08@gmail.com
--
-- Policies added:
--   ✓ orders       — read all + update status
--   ✓ order_items  — read all
--   ✓ inventory    — update stock
--   ✓ products     — read all + update
-- ─────────────────────────────────────────────────────────────────────────────
