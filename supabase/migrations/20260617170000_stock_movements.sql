create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  presentation_id uuid references public.product_presentations(id) on delete set null,
  movement_type text not null check (movement_type in ('entry', 'exit', 'set')),
  quantity numeric(12, 3) not null check (quantity > 0),
  quantity_base_units numeric(12, 3) not null check (quantity_base_units <> 0),
  previous_stock numeric(12, 3) not null,
  new_stock numeric(12, 3) not null check (new_stock >= 0),
  reason text not null check (char_length(btrim(reason)) > 0),
  notes text,
  created_by uuid not null references public.admin_users(user_id) on delete restrict,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint stock_movements_stock_delta_check
    check (round((previous_stock + quantity_base_units - new_stock)::numeric, 3) = 0),
  constraint stock_movements_direction_check
    check (
      (movement_type = 'entry' and quantity_base_units > 0) or
      (movement_type = 'exit' and quantity_base_units < 0) or
      (movement_type = 'set')
    )
);

create index if not exists stock_movements_created_at_idx
  on public.stock_movements(created_at desc);

create index if not exists stock_movements_product_id_idx
  on public.stock_movements(product_id);

create index if not exists stock_movements_presentation_id_idx
  on public.stock_movements(presentation_id);

create index if not exists stock_movements_movement_type_idx
  on public.stock_movements(movement_type);

grant select, insert on public.stock_movements to authenticated;

alter table public.stock_movements enable row level security;

drop policy if exists stock_movements_admin_manage on public.stock_movements;
create policy stock_movements_admin_manage
on public.stock_movements
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
