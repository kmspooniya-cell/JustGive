-- Pay-it-forward prompts on the Wall of Kindness.
-- An approved message may carry one short optional prompt that turns it into a loop:
-- "if this found you, pass it on" plus a small action. It is never a purchase, never a
-- reward, and never allocates funds. Prompts are opt-in per message by the author at
-- submission time (stored with the message) and only shown for approved messages.

alter table public.messages
  add column pass_it_on text check (pass_it_on is null or char_length(pass_it_on) between 1 and 140);

comment on column public.messages.pass_it_on is
  'Optional short prompt inviting the reader to pass kindness on. Not a purchase, reward, or fund allocation.';
-- Expose the prompt on the public approved-message view.
create or replace view public.approved_messages with (security_invoker = true) as
  select id, body, locale, created_at, pass_it_on from public.messages where status = 'approved' and public_consent = true;
revoke all on public.approved_messages from anon, authenticated;
grant select (id, body, locale, created_at, pass_it_on) on public.approved_messages to anon, authenticated;
