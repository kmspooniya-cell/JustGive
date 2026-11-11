-- Public configuration is limited to two non-sensitive visual feature switches.
insert into public.site_settings(key, value, is_public)
values ('kindness_universe', '{"enabled":true}'::jsonb, true),
       ('kindness_tree', '{"enabled":true}'::jsonb, true)
on conflict (key) do nothing;

create policy "public read visual feature switches" on public.site_settings
  for select to anon, authenticated using (is_public = true and key in ('kindness_universe','kindness_tree'));
grant select (key, value) on public.site_settings to anon, authenticated;

-- Reporter identity is a keyed hash created by the server; raw network identifiers are not stored.
alter table public.message_reports
  add column reporter_hash text check (reporter_hash is null or reporter_hash ~ '^[0-9a-f]{64}$');
alter table public.message_reports add constraint message_reports_reason_category_check
  check (reason is null or reason in ('spam','harassment','personal_information','other'));
create unique index message_reports_reporter_once_idx
  on public.message_reports(message_id, reporter_hash) where reporter_hash is not null;
create or replace function public.report_public_message(target_message_id uuid, input_reporter_hash text, input_reason text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare inserted_count integer;
begin
  if input_reporter_hash !~ '^[0-9a-f]{64}$' or input_reason not in ('spam','harassment','personal_information','other') then return false; end if;
  if not exists (select 1 from public.messages where id=target_message_id and status='approved' and public_consent=true) then return false; end if;
  insert into public.message_reports(message_id, reporter_hash, reason)
    values (target_message_id, input_reporter_hash, input_reason) on conflict (message_id, reporter_hash) where reporter_hash is not null do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 1 then
    update public.messages set report_count=report_count+1 where id=target_message_id and status='approved' and public_consent=true;
  end if;
  return true;
end;
$$;
revoke all on function public.report_public_message(uuid, text, text) from public, anon, authenticated;
grant execute on function public.report_public_message(uuid, text, text) to service_role;

create or replace function public.restore_reported_message(target_message_id uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  if not public.is_admin() then return false; end if;
  if not exists (select 1 from public.messages where id=target_message_id and status='removed' and public_consent=true) then return false; end if;
  update public.messages set status='approved', moderated_at=now(), moderated_by=auth.uid()
    where id=target_message_id and status='removed' and public_consent=true;
  return found;
end;
$$;
revoke all on function public.restore_reported_message(uuid) from public, anon;
grant execute on function public.restore_reported_message(uuid) to authenticated;

-- Repeated community reports remove a post from public views pending human review.
create or replace function public.auto_hide_heavily_reported_message() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.report_count >= 5 and new.status = 'approved' and old.status = 'approved' then
    update public.messages set status='removed', moderated_at=now(), moderated_by=null where id=new.id;
    insert into public.admin_activity(admin_user_id, action, entity_type, entity_id, details)
      values (null, 'auto_hide:message_reports', 'messages', new.id, jsonb_build_object('report_count', new.report_count));
  end if;
  return new;
end;
$$;
revoke all on function public.auto_hide_heavily_reported_message() from public;
create trigger auto_hide_heavily_reported_message after update of report_count on public.messages
  for each row execute function public.auto_hide_heavily_reported_message();

-- A journal is private to its authenticated admin author, even from other administrators.
create table public.gratitude_journal (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_users(user_id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.gratitude_journal enable row level security;
create policy "admins manage own gratitude entries" on public.gratitude_journal
  for all to authenticated using (admin_user_id = auth.uid() and (select public.is_admin()))
  with check (admin_user_id = auth.uid() and (select public.is_admin()));
revoke all on public.gratitude_journal from anon, authenticated;
grant select, insert, update, delete on public.gratitude_journal to authenticated;
create trigger audit_gratitude_journal after insert or update or delete on public.gratitude_journal
  for each row execute function public.audit_admin_content_change();

-- Keep configuration audit records useful without copying arbitrary setting values.
drop trigger if exists audit_settings_change on public.site_settings;
create or replace function public.audit_site_setting_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare row_data jsonb; setting_key text;
begin
  row_data := case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
  setting_key := row_data->>'key';
  if auth.uid() is not null and public.is_admin() then
    insert into public.admin_activity(admin_user_id, action, entity_type, details)
      values (auth.uid(), lower(tg_op)||':site_settings', 'site_settings',
        case when setting_key in ('kindness_universe','kindness_tree')
          then jsonb_build_object('key',setting_key,'enabled',row_data->'value'->'enabled')
          else jsonb_build_object('key',setting_key) end);
  end if;
  if tg_op='DELETE' then return old; else return new; end if;
end;
$$;
revoke all on function public.audit_site_setting_change() from public;
create trigger audit_settings_change after insert or update or delete on public.site_settings
  for each row execute function public.audit_site_setting_change();

-- The current provider flow does not collect payer accounts. Future history access
-- must be linked to a verified owner identity or a high-entropy, expiring capability.
-- No public query or payer PII is added here; live payment approval remains external.
