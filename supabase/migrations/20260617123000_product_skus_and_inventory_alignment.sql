alter table public.products
  add column if not exists base_sku text;

alter table public.product_presentations
  add column if not exists sku text;

alter table public.purchase_order_items
  add column if not exists base_sku_snapshot text,
  add column if not exists presentation_sku_snapshot text,
  add column if not exists amount_in_base_units_snapshot numeric(12, 3);

alter table public.sale_items
  add column if not exists base_sku_snapshot text,
  add column if not exists presentation_sku_snapshot text,
  add column if not exists amount_in_base_units_snapshot numeric(12, 3);

with seeded as (
  select
    id,
    upper(regexp_replace(coalesce(nullif(base_sku, ''), slug, name), '[^a-zA-Z0-9]+', '-', 'g')) as raw_sku
  from public.products
),
normalized as (
  select
    id,
    trim(both '-' from regexp_replace(raw_sku, '-{2,}', '-', 'g')) as normalized_sku
  from seeded
),
deduped as (
  select
    id,
    case
      when row_number() over (partition by normalized_sku order by id) = 1 then normalized_sku
      else normalized_sku || '-' || row_number() over (partition by normalized_sku order by id)
    end as final_sku
  from normalized
)
update public.products as p
set base_sku = d.final_sku
from deduped d
where p.id = d.id
  and coalesce(nullif(p.base_sku, ''), '') <> d.final_sku;

with prepared as (
  select
    pp.id,
    p.base_sku,
    case
      when pp.measurement_kind = 'unit' then
        case
          when round(pp.amount_value::numeric, 3) = 1 then 'UN'
          else trim(trailing '.' from trim(trailing '0' from pp.amount_value::text)) || 'UN'
        end
      when pp.measurement_kind = 'weight' then
        trim(trailing '.' from trim(trailing '0' from pp.amount_value::text)) ||
        upper(pp.amount_unit)
      when pp.measurement_kind = 'volume' then
        trim(trailing '.' from trim(trailing '0' from pp.amount_value::text)) ||
        upper(pp.amount_unit)
      else upper(regexp_replace(pp.label, '[^a-zA-Z0-9]+', '-', 'g'))
    end as suffix
  from public.product_presentations pp
  inner join public.products p
    on p.id = pp.product_id
),
normalized as (
  select
    id,
    trim(both '-' from regexp_replace(base_sku || '-' || suffix, '-{2,}', '-', 'g')) as normalized_sku
  from prepared
),
deduped as (
  select
    id,
    case
      when row_number() over (partition by normalized_sku order by id) = 1 then normalized_sku
      else normalized_sku || '-' || row_number() over (partition by normalized_sku order by id)
    end as final_sku
  from normalized
)
update public.product_presentations as pp
set sku = d.final_sku
from deduped d
where pp.id = d.id
  and coalesce(nullif(pp.sku, ''), '') <> d.final_sku;

update public.purchase_order_items as poi
set
  base_sku_snapshot = coalesce(poi.base_sku_snapshot, p.base_sku),
  presentation_sku_snapshot = coalesce(poi.presentation_sku_snapshot, pp.sku),
  amount_in_base_units_snapshot = coalesce(poi.amount_in_base_units_snapshot, pp.amount_in_base_units)
from public.product_presentations pp
inner join public.products p
  on p.id = pp.product_id
where pp.id = poi.product_presentation_id;

update public.sale_items as si
set
  base_sku_snapshot = coalesce(si.base_sku_snapshot, p.base_sku),
  presentation_sku_snapshot = coalesce(si.presentation_sku_snapshot, pp.sku),
  amount_in_base_units_snapshot = coalesce(si.amount_in_base_units_snapshot, pp.amount_in_base_units)
from public.product_presentations pp
inner join public.products p
  on p.id = pp.product_id
where pp.id = si.product_presentation_id;

create unique index if not exists products_base_sku_unique_idx
  on public.products (base_sku)
  where base_sku is not null;

create unique index if not exists product_presentations_sku_unique_idx
  on public.product_presentations (sku)
  where sku is not null;

create index if not exists purchase_order_items_base_sku_snapshot_idx
  on public.purchase_order_items (base_sku_snapshot);

create index if not exists sale_items_presentation_sku_snapshot_idx
  on public.sale_items (presentation_sku_snapshot);
