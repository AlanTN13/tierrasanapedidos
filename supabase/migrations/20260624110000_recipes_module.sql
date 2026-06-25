create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null,
  long_description text not null,
  hero_image_path text not null,
  target_category text not null,
  prep_label text not null,
  servings_label text not null,
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.recipe_products (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (recipe_id, product_id)
);

create index if not exists recipes_sort_order_idx
  on public.recipes(is_active, sort_order, title);

create index if not exists recipe_products_product_id_idx
  on public.recipe_products(product_id, sort_order);

drop trigger if exists set_recipes_updated_at on public.recipes;
create trigger set_recipes_updated_at
before update on public.recipes
for each row execute procedure public.set_updated_at();

grant select on public.recipes to anon, authenticated;
grant select on public.recipe_products to anon, authenticated;

grant select, insert, update, delete on public.recipes to authenticated;
grant select, insert, update, delete on public.recipe_products to authenticated;

alter table public.recipes enable row level security;
alter table public.recipe_products enable row level security;

drop policy if exists recipes_public_read on public.recipes;
create policy recipes_public_read
on public.recipes
for select
to anon, authenticated
using (is_active);

drop policy if exists recipes_authenticated_manage on public.recipes;
create policy recipes_authenticated_manage
on public.recipes
for all
to authenticated
using ((select auth.uid()) is not null)
with check ((select auth.uid()) is not null);

drop policy if exists recipe_products_public_read on public.recipe_products;
create policy recipe_products_public_read
on public.recipe_products
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    where id = recipe_id
      and is_active
  )
  and exists (
    select 1
    from public.products
    where id = product_id
      and is_active
  )
);

drop policy if exists recipe_products_authenticated_manage on public.recipe_products;
create policy recipe_products_authenticated_manage
on public.recipe_products
for all
to authenticated
using ((select auth.uid()) is not null)
with check ((select auth.uid()) is not null);
