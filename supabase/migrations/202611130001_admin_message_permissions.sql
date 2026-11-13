-- Keep report counts private and expose moderation only through admin-checked RPCs.
revoke select (report_count) on public.messages from anon, authenticated;
revoke update on public.messages from authenticated;
revoke update (id, body, locale, public_consent, status, report_count, created_at, moderated_at, moderated_by, appreciation_count, pass_it_on)
  on public.messages from authenticated;

create or replace function public.restore_reported_message(target_message_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.messages
    where id = target_message_id and status = 'removed' and public_consent = true
  ) then
    return false;
  end if;
  update public.messages
    set status = 'approved', moderated_at = now(), moderated_by = auth.uid()
    where id = target_message_id and status = 'removed' and public_consent = true;
  return found;
end;
$$;
revoke all on function public.restore_reported_message(uuid) from public, anon;
grant execute on function public.restore_reported_message(uuid) to authenticated;

create or replace function public.admin_list_messages()
returns table (
  id uuid,
  body text,
  locale text,
  status text,
  public_consent boolean,
  created_at timestamptz,
  report_count integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  return query
    select m.id, m.body, m.locale, m.status, m.public_consent, m.created_at, m.report_count
    from public.messages m
    order by m.created_at desc
    limit 100;
end;
$$;
revoke all on function public.admin_list_messages() from public, anon;
grant execute on function public.admin_list_messages() to authenticated;

create or replace function public.admin_moderate_message(target_message_id uuid, requested_action text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if requested_action = 'approve' then
    update public.messages
      set status = 'approved', moderated_at = now(), moderated_by = auth.uid()
      where id = target_message_id and status in ('pending', 'removed')
        and public_consent = true and report_count < 5;
  elsif requested_action = 'reject' then
    update public.messages
      set status = 'rejected', moderated_at = now(), moderated_by = auth.uid()
      where id = target_message_id and status = 'pending';
  elsif requested_action = 'remove' then
    update public.messages
      set status = 'removed', moderated_at = now(), moderated_by = auth.uid()
      where id = target_message_id and status = 'approved';
  else
    return false;
  end if;

  return found;
end;
$$;
revoke all on function public.admin_moderate_message(uuid, text) from public, anon;
grant execute on function public.admin_moderate_message(uuid, text) to authenticated;
