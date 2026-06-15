alter table public.product_presentations
  add column if not exists measurement_kind text,
  add column if not exists amount_value numeric(12, 3),
  add column if not exists amount_unit text,
  add column if not exists amount_in_base_units numeric(12, 3);

with parsed as (
  select
    id,
    coalesce(
      nullif(replace((regexp_match(lower(label), '([0-9]+(?:[.,][0-9]+)?)'))[1], ',', '.'), '')::numeric,
      1
    ) as parsed_amount,
    case
      when lower(label) ~ 'kg' then 'weight'
      when lower(label) ~ 'gram|(^|[^a-z])gr([^a-z]|$)|(^|[^a-z])g([^a-z]|$)' then 'weight'
      when lower(label) ~ 'ml' then 'volume'
      when lower(label) ~ 'litro|litros|(^|[^a-z])l([^a-z]|$)' and lower(label) !~ 'ml' then 'volume'
      else 'unit'
    end as parsed_kind,
    case
      when lower(label) ~ 'kg' then 'kg'
      when lower(label) ~ 'gram|(^|[^a-z])gr([^a-z]|$)|(^|[^a-z])g([^a-z]|$)' then 'g'
      when lower(label) ~ 'ml' then 'ml'
      when lower(label) ~ 'litro|litros|(^|[^a-z])l([^a-z]|$)' and lower(label) !~ 'ml' then 'l'
      else 'unit'
    end as parsed_unit
  from public.product_presentations
)
update public.product_presentations as pp
set
  measurement_kind = coalesce(pp.measurement_kind, parsed.parsed_kind),
  amount_value = coalesce(pp.amount_value, parsed.parsed_amount),
  amount_unit = coalesce(pp.amount_unit, parsed.parsed_unit),
  amount_in_base_units = coalesce(
    pp.amount_in_base_units,
    case
      when parsed.parsed_unit in ('kg', 'l') then round((parsed.parsed_amount * 1000)::numeric, 3)
      else round(parsed.parsed_amount::numeric, 3)
    end
  )
from parsed
where pp.id = parsed.id;

update public.product_presentations
set
  measurement_kind = coalesce(measurement_kind, 'unit'),
  amount_value = coalesce(amount_value, 1),
  amount_unit = coalesce(amount_unit, 'unit'),
  amount_in_base_units = coalesce(amount_in_base_units, 1);

alter table public.product_presentations
  alter column measurement_kind set not null,
  alter column measurement_kind set default 'unit',
  alter column amount_value set not null,
  alter column amount_value set default 1,
  alter column amount_unit set not null,
  alter column amount_unit set default 'unit',
  alter column amount_in_base_units set not null,
  alter column amount_in_base_units set default 1;

alter table public.product_presentations
  drop constraint if exists product_presentations_measurement_kind_check,
  add constraint product_presentations_measurement_kind_check
    check (measurement_kind in ('unit', 'weight', 'volume')),
  drop constraint if exists product_presentations_amount_unit_check,
  add constraint product_presentations_amount_unit_check
    check (amount_unit in ('unit', 'g', 'kg', 'ml', 'l')),
  drop constraint if exists product_presentations_amount_value_check,
  add constraint product_presentations_amount_value_check
    check (amount_value > 0),
  drop constraint if exists product_presentations_amount_in_base_units_check,
  add constraint product_presentations_amount_in_base_units_check
    check (amount_in_base_units > 0),
  drop constraint if exists product_presentations_measurement_consistency_check,
  add constraint product_presentations_measurement_consistency_check
    check (
      (measurement_kind = 'unit' and amount_unit = 'unit')
      or (measurement_kind = 'weight' and amount_unit in ('g', 'kg'))
      or (measurement_kind = 'volume' and amount_unit in ('ml', 'l'))
    );
