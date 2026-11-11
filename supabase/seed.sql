-- Development only. Apply manually to a local Supabase project, never production.
-- Deliberately contains no financial rows or fake statistics.
insert into public.site_settings(key, value, is_public) values
  ('brand', '{"name":"JustGive","tagline":"Give Freely. Feel Good. Repeat."}'::jsonb, true)
on conflict (key) do nothing;
