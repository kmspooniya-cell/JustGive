create trigger audit_contact_status_change after update on public.contact_messages
  for each row when (old.status is distinct from new.status)
  execute function public.audit_admin_content_change();
