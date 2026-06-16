alter table public.sales
  add column if not exists sale_number bigint;

create sequence if not exists public.sales_sale_number_seq;

alter sequence public.sales_sale_number_seq
  owned by public.sales.sale_number;

with current_max as (
  select coalesce(max(sale_number), 0) as value
  from public.sales
),
ordered_sales as (
  select
    sales.id,
    current_max.value + row_number() over (
      order by sales.sold_at asc, sales.created_at asc, sales.id asc
    ) as next_sale_number
  from public.sales as sales
  cross join current_max
  where sales.sale_number is null
)
update public.sales
set sale_number = ordered_sales.next_sale_number
from ordered_sales
where public.sales.id = ordered_sales.id;

select setval(
  'public.sales_sale_number_seq',
  coalesce((select max(sale_number) from public.sales), 0) + 1,
  false
);

alter table public.sales
  alter column sale_number set default nextval('public.sales_sale_number_seq');

alter table public.sales
  alter column sale_number set not null;

create unique index if not exists sales_sale_number_idx
  on public.sales(sale_number);
