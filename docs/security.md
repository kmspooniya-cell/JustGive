# Security

- Browser code contains no secret keys; Supabase SSR uses only the publishable key.
- API handlers validate with Zod and payment statuses cannot be set by the browser. Simulated payment routes are disabled in production.
- Supabase RLS defaults private for payment, refund, event, setting, activity and contact data. Apply migration `202611110003_server_only_public_writes.sql` to revoke direct anonymous message/contact writes and public report RPC execution; these writes then require the server-only Supabase secret/service-role key and validated, rate-limited API routes.
- `is_admin()` checks the protected `admin_users` table, never user-editable metadata. Bootstrap roles manually through privileged SQL.
- HTTP response headers include frame/content-type/referrer/permissions protections and a restrictive CSP. Review CSP if trusted hosted checkout is later approved.
- Rate limiting currently has a local-only fallback; production public writes are closed until a distributed rate limiter is configured. Address bucketing uses only `x-real-ip`, which must be overwritten by the hosting proxy; `x-forwarded-for` is ignored. CAPTCHA is not yet integrated.
- Do not put personal data in public messages, application logs, or financial reports. Payment providers, banks, and legally authorized parties may process identity and transaction data.
