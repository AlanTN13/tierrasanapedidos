-- Additive setup, to apply only with release acceptance. No content is replaced.
begin;

alter table public.home_settings add column if not exists hero_banners jsonb;

alter table public.home_settings drop constraint if exists home_settings_hero_banners_count;
alter table public.home_settings add constraint home_settings_hero_banners_count check (
  hero_banners is null or
  case when jsonb_typeof(hero_banners) = 'array'
    then jsonb_array_length(hero_banners) between 1 and 4
    else false
  end
);

comment on column public.home_settings.hero_banners is
  'Ordered home banners (1 to 4): id, desktopPath, optional mobilePath, alt. NULL preserves legacy banner.';

commit;

-- Verification after applying:
-- select id, hero_banner_path, hero_banner_mobile_path, hero_banners from public.home_settings where id = 'main';
-- No new policy, grant or service credential is needed; existing home_settings RLS applies.
-- Code rollback: leave this nullable column and previous image files in place.
