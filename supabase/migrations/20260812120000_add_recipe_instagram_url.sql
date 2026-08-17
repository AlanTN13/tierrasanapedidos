alter table public.recipes
  add column if not exists instagram_url text;

comment on column public.recipes.instagram_url is
  'URL opcional de la publicación de Instagram asociada a la receta.';
