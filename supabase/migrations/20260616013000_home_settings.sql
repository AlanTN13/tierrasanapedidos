create table if not exists public.home_settings (
  id text primary key default 'main' check (id = 'main'),
  hero_banner_path text,
  hero_banner_alt text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

insert into public.home_settings (id, hero_banner_path, hero_banner_alt)
values ('main', '/hero-optimized/banner-home.webp', 'Armá tu pedido en 3 pasos')
on conflict (id) do nothing;

drop trigger if exists set_home_settings_updated_at on public.home_settings;
create trigger set_home_settings_updated_at
before update on public.home_settings
for each row execute procedure public.set_updated_at();

grant select on public.home_settings to anon, authenticated;
grant select, insert, update, delete on public.home_settings to authenticated;

alter table public.home_settings enable row level security;

drop policy if exists home_settings_public_read on public.home_settings;
create policy home_settings_public_read
on public.home_settings
for select
to anon, authenticated
using (id = 'main');

drop policy if exists home_settings_admin_manage on public.home_settings;
create policy home_settings_admin_manage
on public.home_settings
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
