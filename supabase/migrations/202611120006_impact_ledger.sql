-- Owner impact ledger.
-- A private, admin-managed log of how the owner personally used their resources. This is
-- NOT a charitable allocation, NOT a fund statement, and NOT linked to any contribution.
-- It exists so the owner can publish honest, dated notes about personal acts of support.
-- Public read is limited to explicitly published entries.

create table public.impact_entries (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('en','hi')),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 600),
  happened_on date not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_users(user_id)
);
create index impact_entries_public_idx on public.impact_entries(locale, happened_on desc) where published;
alter table public.impact_entries enable row level security;
create policy "admins manage impact entries" on public.impact_entries for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "public read published impact entries" on public.impact_entries for select to anon, authenticated
  using (published = true);
revoke all on public.impact_entries from anon, authenticated;
grant select (id, locale, title, body, happened_on) on public.impact_entries to anon, authenticated;
grant select, insert, update, delete on public.impact_entries to authenticated;

create trigger audit_impact_entries_change after insert or update or delete on public.impact_entries for each row
  execute function public.audit_admin_content_change();