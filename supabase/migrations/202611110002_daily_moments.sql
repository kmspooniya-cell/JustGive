create table public.daily_moments (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('en','hi')),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 500),
  publish_at timestamptz not null default now(),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_users(user_id)
);
create index daily_moments_public_idx on public.daily_moments(locale, publish_at desc) where published;
alter table public.daily_moments enable row level security;
create policy "admins manage daily moments" on public.daily_moments for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "public read published daily moments" on public.daily_moments for select to anon, authenticated
  using (published and publish_at <= now());
revoke all on public.daily_moments from anon, authenticated;
grant select (id, locale, title, body, publish_at) on public.daily_moments to anon, authenticated;
grant select, insert, update, delete on public.daily_moments to authenticated;
create trigger audit_daily_moments_change after insert or update or delete on public.daily_moments for each row
  execute function public.audit_admin_content_change();
