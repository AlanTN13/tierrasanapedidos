create extension if not exists pgcrypto;

create schema if not exists private;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  image_path text,
  search_tags text[] not null default '{}',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  image_path text,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  featured_order integer,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.product_presentations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  price_cents integer not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (product_id, category_id)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists categories_sort_order_idx
  on public.categories(sort_order);

create index if not exists products_featured_idx
  on public.products(is_featured, featured_order);

create index if not exists product_presentations_product_id_idx
  on public.product_presentations(product_id, sort_order);

create index if not exists product_categories_category_id_idx
  on public.product_categories(category_id, sort_order);

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute procedure public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

drop trigger if exists set_product_presentations_updated_at on public.product_presentations;
create trigger set_product_presentations_updated_at
before update on public.product_presentations
for each row execute procedure public.set_updated_at();

grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_presentations to anon, authenticated;
grant select on public.product_categories to anon, authenticated;

grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_presentations to authenticated;
grant select, insert, update, delete on public.product_categories to authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_presentations enable row level security;
alter table public.product_categories enable row level security;
alter table public.admin_users enable row level security;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read
on public.categories
for select
to anon, authenticated
using (is_active);

drop policy if exists categories_admin_manage on public.categories;
create policy categories_admin_manage
on public.categories
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists products_public_read on public.products;
create policy products_public_read
on public.products
for select
to anon, authenticated
using (is_active);

drop policy if exists products_admin_manage on public.products;
create policy products_admin_manage
on public.products
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists product_presentations_public_read on public.product_presentations;
create policy product_presentations_public_read
on public.product_presentations
for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.products
    where id = product_id
      and is_active
  )
);

drop policy if exists product_presentations_admin_manage on public.product_presentations;
create policy product_presentations_admin_manage
on public.product_presentations
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists product_categories_public_read on public.product_categories;
create policy product_categories_public_read
on public.product_categories
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where id = product_id
      and is_active
  )
  and exists (
    select 1
    from public.categories
    where id = category_id
      and is_active
  )
);

drop policy if exists product_categories_admin_manage on public.product_categories;
create policy product_categories_admin_manage
on public.product_categories
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read
on public.admin_users
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (select private.is_admin())
);

drop policy if exists admin_users_admin_manage on public.admin_users;
create policy admin_users_admin_manage
on public.admin_users
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
