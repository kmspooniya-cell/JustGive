create extension if not exists pgcrypto with schema extensions;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
create policy "admins can view own role" on public.admin_users for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  internal_order_id text not null unique,
  provider text not null,
  provider_order_id text unique,
  provider_payment_id text unique,
  amount_paise bigint not null check (amount_paise between 100 and 10000000),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'created' check (status in ('created','pending','successful','failed','refunded','partially_refunded')),
  refund_status text not null default 'none' check (refund_status in ('none','pending','partial','refunded','failed')),
  created_at timestamptz not null default now(),
  verified_paid_at timestamptz,
  reconciliation_reference text,
  reconciled_at timestamptz,
  gateway_fee_paise bigint check (gateway_fee_paise is null or gateway_fee_paise >= 0),
  settlement_amount_paise bigint check (settlement_amount_paise is null or settlement_amount_paise >= 0),
  settlement_reference text,
  settlement_reconciled_at timestamptz,
  is_demo boolean not null default false,
  check ((status = 'successful' and verified_paid_at is not null) or status <> 'successful')
);
create index contributions_status_created_idx on public.contributions(status, created_at desc);
create index contributions_provider_order_idx on public.contributions(provider, provider_order_id);
create index contributions_payment_idx on public.contributions(provider_payment_id) where provider_payment_id is not null;
alter table public.contributions enable row level security;
create policy "admins read contributions" on public.contributions for select to authenticated using ((select public.is_admin()));
revoke all on public.contributions from anon, authenticated;
grant select on public.contributions to authenticated;

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid references public.contributions(id),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload_hash text not null,
  verified boolean not null default false,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider, provider_event_id)
);
create index payment_events_contribution_idx on public.payment_events(contribution_id, received_at desc);
alter table public.payment_events enable row level security;
create policy "admins read payment events" on public.payment_events for select to authenticated using ((select public.is_admin()));
revoke all on public.payment_events from anon, authenticated;
grant select on public.payment_events to authenticated;

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions(id),
  amount_paise bigint not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  provider_refund_id text unique,
  status text not null default 'pending' check (status in ('pending','successful','failed')),
  reason text not null,
  initiated_by uuid references public.admin_users(user_id),
  provider_response jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.refunds enable row level security;
create policy "admins read refunds" on public.refunds for select to authenticated using ((select public.is_admin()));
revoke all on public.refunds from anon, authenticated;
grant select on public.refunds to authenticated;

create table public.settlement_records (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions(id),
  provider text not null,
  provider_settlement_id text not null,
  gross_paise bigint not null check (gross_paise >= 0),
  fee_paise bigint check (fee_paise is null or fee_paise >= 0),
  net_paise bigint check (net_paise is null or net_paise >= 0),
  settled_at timestamptz,
  reconciled_at timestamptz,
  unique(provider, provider_settlement_id, contribution_id)
);
alter table public.settlement_records enable row level security;
create policy "admins read settlements" on public.settlement_records for select to authenticated using ((select public.is_admin()));
revoke all on public.settlement_records from anon, authenticated;
grant select on public.settlement_records to authenticated;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(body) between 1 and 300),
  locale text not null default 'en' check (locale in ('en','hi')),
  public_consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected','removed')),
  report_count integer not null default 0 check (report_count >= 0),
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  moderated_by uuid references public.admin_users(user_id),
  check (status <> 'approved' or public_consent = true)
);
create index messages_public_idx on public.messages(created_at desc) where status = 'approved' and public_consent;
alter table public.messages enable row level security;
create policy "submit pending message" on public.messages for insert to anon, authenticated with check (status = 'pending' and report_count = 0 and moderated_by is null and moderated_at is null);
create policy "admins read messages" on public.messages for select to authenticated using ((select public.is_admin()));
create policy "admins moderate messages" on public.messages for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "public read approved messages" on public.messages for select to anon, authenticated using (status = 'approved' and public_consent = true);
revoke all on public.messages from anon, authenticated;
grant insert on public.messages to anon, authenticated;
grant select (id, body, locale, created_at, status, public_consent) on public.messages to anon, authenticated;
grant update on public.messages to authenticated;
create view public.approved_messages with (security_invoker = true) as
  select id, body, locale, created_at from public.messages where status = 'approved' and public_consent = true;
revoke all on public.approved_messages from anon, authenticated;
grant select on public.approved_messages to anon, authenticated;

create table public.message_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  reason text check (reason is null or char_length(reason) <= 500),
  created_at timestamptz not null default now()
);
alter table public.message_reports enable row level security;
create policy "admins read reports" on public.message_reports for select to authenticated using ((select public.is_admin()));
revoke all on public.message_reports from anon, authenticated;
grant select on public.message_reports to authenticated;
create or replace function public.report_public_message(target_message_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.messages where id=target_message_id and status='approved' and public_consent=true) then return false; end if;
  insert into public.message_reports(message_id) values (target_message_id);
  update public.messages set report_count=report_count+1 where id=target_message_id;
  return true;
end;
$$;
revoke all on function public.report_public_message(uuid) from public;
grant execute on function public.report_public_message(uuid) to anon, authenticated;

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_users(user_id)
);
alter table public.site_settings enable row level security;
create policy "admins manage settings" on public.site_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
revoke all on public.site_settings from anon, authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;

create table public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users(user_id),
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_activity_created_idx on public.admin_activity(created_at desc);
alter table public.admin_activity enable row level security;
create policy "admins read activity" on public.admin_activity for select to authenticated using ((select public.is_admin()));
revoke all on public.admin_activity from anon, authenticated;
grant select on public.admin_activity to authenticated;

create or replace function public.audit_admin_content_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare row_data jsonb;
begin
  row_data := case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
  if auth.uid() is not null and public.is_admin() then
    insert into public.admin_activity(admin_user_id, action, entity_type, entity_id, details)
    values (auth.uid(), lower(tg_op) || ':' || tg_table_name, tg_table_name,
      case when row_data ? 'id' then (row_data->>'id')::uuid else null end,
      case when tg_table_name='messages' then jsonb_build_object('status',row_data->>'status') else '{}'::jsonb end);
  end if;
  if tg_op='DELETE' then return old; else return new; end if;
end;
$$;
revoke all on function public.audit_admin_content_change() from public;
create trigger audit_message_moderation after update on public.messages for each row
  when (old.status is distinct from new.status) execute function public.audit_admin_content_change();
create trigger audit_settings_change after insert or update or delete on public.site_settings for each row
  execute function public.audit_admin_content_change();

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254),
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'unread' check (status in ('unread','read','closed')),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
create policy "public submit contact" on public.contact_messages for insert to anon, authenticated with check (status = 'unread');
create policy "admins manage contact" on public.contact_messages for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
revoke all on public.contact_messages from anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

-- Aggregate functions intentionally exclude simulated payments. No row-level financial data is public.
create or replace function public.public_contribution_summary()
returns table(successful_count bigint, gross_paise bigint, refund_paise bigint, gateway_fees_paise bigint, net_settlement_paise bigint, last_updated timestamptz)
language sql stable security definer set search_path = '' as $$
  with verified as (
    select id, amount_paise, gateway_fee_paise, settlement_amount_paise, settlement_reconciled_at, verified_paid_at
    from public.contributions where status = 'successful' and verified_paid_at is not null and is_demo = false
  )
  select count(*)::bigint, sum(v.amount_paise)::bigint,
    coalesce((select sum(r.amount_paise)::bigint from public.refunds r join verified vr on vr.id=r.contribution_id where r.status='successful'),0)::bigint,
    case when count(*)=count(v.gateway_fee_paise) then sum(v.gateway_fee_paise)::bigint else null end,
    case when count(*)=count(v.settlement_amount_paise) and count(*)=count(v.settlement_reconciled_at) then sum(v.settlement_amount_paise)::bigint else null end,
    max(v.verified_paid_at)
  from verified v having count(*) > 0
$$;
revoke all on function public.public_contribution_summary() from public;
grant execute on function public.public_contribution_summary() to anon, authenticated;
