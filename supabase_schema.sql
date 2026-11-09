-- ==============================================================
-- ScoopMatch: Supabase SQL Setup Script
-- Copy dan Paste script ini ke SQL Editor di dashboard Supabase Anda
-- (Aman dijalankan berkali-kali tanpa error)
-- ==============================================================

-- 1. Buat Tabel orders jika belum ada
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_name text not null,
  customer_phone text default '',
  notes text default '',
  flavor_id text not null,
  flavor_name text not null,
  serving text not null default 'gabin-sweet',
  size text not null default 'single',
  second_flavor_id text default null,
  second_flavor_name text default null,
  toppings jsonb default '[]'::jsonb,
  total_price numeric not null default 0,
  payment_method text not null default 'qris', -- 'qris' | 'cash'
  payment_status text not null default 'unpaid', -- 'unpaid' | 'paid'
  status text not null default 'pending', -- 'pending' | 'diproses' | 'selesai'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tambahkan kolom jika tabel sudah ada dari versi sebelumnya
alter table public.orders add column if not exists customer_phone text default '';
alter table public.orders add column if not exists second_flavor_id text default null;
alter table public.orders add column if not exists second_flavor_name text default null;
alter table public.orders add column if not exists payment_method text default 'qris';
alter table public.orders add column if not exists payment_status text default 'unpaid';
alter table public.orders add column if not exists order_type text default 'regular';
alter table public.orders add column if not exists po_session_id text default null;
alter table public.orders add column if not exists po_session_name text default null;
alter table public.orders add column if not exists po_time_range text default null;
alter table public.orders add column if not exists proof_image_url text default null;

-- 2. Aktifkan Row Level Security (RLS)
alter table public.orders enable row level security;

-- 3. Kebijakan RLS (Hapus dulu jika sudah ada agar TIDAK error 42710)
drop policy if exists "Allow public read access" on public.orders;
create policy "Allow public read access"
  on public.orders for select
  using (true);

drop policy if exists "Allow public insert access" on public.orders;
create policy "Allow public insert access"
  on public.orders for insert
  with check (true);

drop policy if exists "Allow public update access" on public.orders;
create policy "Allow public update access"
  on public.orders for update
  using (true);

drop policy if exists "Allow public delete access" on public.orders;
create policy "Allow public delete access"
  on public.orders for delete
  using (true);

-- 4. Aktifkan Fitur Realtime Replication untuk tabel orders (Aman tanpa duplicate error)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;
