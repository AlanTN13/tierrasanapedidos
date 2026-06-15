create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  reference_number text,
  purchased_at timestamptz not null default timezone('utc'::text, now()),
  notes text,
  created_by uuid not null references public.admin_users(user_id) on delete restrict,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_presentation_id uuid not null references public.product_presentations(id) on delete restrict,
  quantity numeric(12, 3) not null check (quantity > 0),
  unit_cost_cents integer not null check (unit_cost_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  sold_at timestamptz not null default timezone('utc'::text, now()),
  channel text not null default 'local',
  notes text,
  created_by uuid not null references public.admin_users(user_id) on delete restrict,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_presentation_id uuid not null references public.product_presentations(id) on delete restrict,
  quantity numeric(12, 3) not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  unit_cost_snapshot_cents integer not null check (unit_cost_snapshot_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  line_margin_cents integer not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists purchase_orders_purchased_at_idx
  on public.purchase_orders(purchased_at desc);

create index if not exists purchase_orders_created_by_idx
  on public.purchase_orders(created_by);

create index if not exists purchase_order_items_purchase_order_id_idx
  on public.purchase_order_items(purchase_order_id);

create index if not exists purchase_order_items_product_presentation_id_idx
  on public.purchase_order_items(product_presentation_id);

create index if not exists sales_sold_at_idx
  on public.sales(sold_at desc);

create index if not exists sales_created_by_idx
  on public.sales(created_by);

create index if not exists sale_items_sale_id_idx
  on public.sale_items(sale_id);

create index if not exists sale_items_product_presentation_id_idx
  on public.sale_items(product_presentation_id);

drop trigger if exists set_purchase_orders_updated_at on public.purchase_orders;
create trigger set_purchase_orders_updated_at
before update on public.purchase_orders
for each row execute procedure public.set_updated_at();

drop trigger if exists set_sales_updated_at on public.sales;
create trigger set_sales_updated_at
before update on public.sales
for each row execute procedure public.set_updated_at();

grant select, insert, update, delete on public.purchase_orders to authenticated;
grant select, insert, update, delete on public.purchase_order_items to authenticated;
grant select, insert, update, delete on public.sales to authenticated;
grant select, insert, update, delete on public.sale_items to authenticated;

alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

drop policy if exists purchase_orders_admin_manage on public.purchase_orders;
create policy purchase_orders_admin_manage
on public.purchase_orders
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists purchase_order_items_admin_manage on public.purchase_order_items;
create policy purchase_order_items_admin_manage
on public.purchase_order_items
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists sales_admin_manage on public.sales;
create policy sales_admin_manage
on public.sales
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists sale_items_admin_manage on public.sale_items;
create policy sale_items_admin_manage
on public.sale_items
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create or replace view public.inventory_summary_by_presentation
with (security_invoker = true) as
with purchased as (
  select
    product_presentation_id,
    coalesce(sum(quantity), 0)::numeric(12, 3) as quantity_purchased,
    coalesce(sum(line_total_cents), 0)::bigint as purchase_cost_cents
  from public.purchase_order_items
  group by product_presentation_id
),
sold as (
  select
    product_presentation_id,
    coalesce(sum(quantity), 0)::numeric(12, 3) as quantity_sold,
    coalesce(sum(line_total_cents), 0)::bigint as revenue_cents,
    coalesce(sum((unit_cost_snapshot_cents * quantity)), 0)::numeric(14, 3) as cost_cents_numeric,
    coalesce(sum(line_margin_cents), 0)::bigint as margin_cents
  from public.sale_items
  group by product_presentation_id
),
latest_purchase_cost as (
  select distinct on (poi.product_presentation_id)
    poi.product_presentation_id,
    poi.unit_cost_cents as last_unit_cost_cents
  from public.purchase_order_items poi
  inner join public.purchase_orders po
    on po.id = poi.purchase_order_id
  order by poi.product_presentation_id, po.purchased_at desc, poi.created_at desc
)
select
  pp.id as product_presentation_id,
  coalesce(purchased.quantity_purchased, 0::numeric(12, 3)) as quantity_purchased,
  coalesce(sold.quantity_sold, 0::numeric(12, 3)) as quantity_sold,
  (coalesce(purchased.quantity_purchased, 0::numeric(12, 3)) - coalesce(sold.quantity_sold, 0::numeric(12, 3)))::numeric(12, 3) as stock_current,
  latest_purchase_cost.last_unit_cost_cents,
  coalesce(sold.revenue_cents, 0)::bigint as revenue_cents,
  coalesce(round(sold.cost_cents_numeric), 0)::bigint as cost_cents,
  coalesce(sold.margin_cents, 0)::bigint as margin_cents
from public.product_presentations pp
left join purchased
  on purchased.product_presentation_id = pp.id
left join sold
  on sold.product_presentation_id = pp.id
left join latest_purchase_cost
  on latest_purchase_cost.product_presentation_id = pp.id;

grant select on public.inventory_summary_by_presentation to authenticated;
