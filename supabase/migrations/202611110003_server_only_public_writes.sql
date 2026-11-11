-- Public form writes must pass through validated and rate-limited API routes.
drop policy if exists "submit pending message" on public.messages;
revoke insert on public.messages from anon, authenticated;
grant insert on public.messages to service_role;

drop policy if exists "public submit contact" on public.contact_messages;
revoke insert on public.contact_messages from anon, authenticated;
grant insert on public.contact_messages to service_role;

-- The API invokes this function only after its per-request rate limit.
revoke all on function public.report_public_message(uuid) from public, anon, authenticated;
grant execute on function public.report_public_message(uuid) to service_role;
