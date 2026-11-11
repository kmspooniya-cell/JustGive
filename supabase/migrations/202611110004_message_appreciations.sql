alter table public.messages add column appreciation_count integer not null default 0 check (appreciation_count >= 0);

create table public.message_appreciations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  visitor_hash text not null check (visitor_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (message_id, visitor_hash)
);
alter table public.message_appreciations enable row level security;
revoke all on public.message_appreciations from anon, authenticated;
grant select, insert on public.message_appreciations to service_role;
grant select (id, status, public_consent, appreciation_count) on public.messages to service_role;
grant select (appreciation_count) on public.messages to anon, authenticated;

create or replace function public.update_message_appreciation_count() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.messages set appreciation_count = appreciation_count + 1 where id = new.message_id;
    return new;
  end if;
  update public.messages set appreciation_count = greatest(0, appreciation_count - 1) where id = old.message_id;
  return old;
end;
$$;
revoke all on function public.update_message_appreciation_count() from public;
create trigger message_appreciation_count after insert or delete on public.message_appreciations
  for each row execute function public.update_message_appreciation_count();

create or replace view public.approved_messages with (security_invoker = true) as
  select id, body, locale, created_at, appreciation_count from public.messages
  where status = 'approved' and public_consent = true;
revoke all on public.approved_messages from anon, authenticated;
grant select on public.approved_messages to anon, authenticated;
