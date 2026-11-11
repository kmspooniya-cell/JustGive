# Deployment

1. Push the reviewed branch to GitHub; do not commit `.env.local`.
2. Create/configure a Supabase project, apply SQL migrations in filename order, configure Auth redirect URLs, and provision administrator UUIDs through trusted SQL.
3. Import the repository into Vercel and set `NEXT_PUBLIC_SITE_URL`, Supabase URL, publishable key, and server-only Supabase secret/service-role key (required for rate-limited public message/contact/report writes). Add all secrets only as server-side environment variables.
4. Keep `PAYMENT_MODE` disabled in production until written provider approval and reviewed provider adapter implementation. The current build intentionally accepts no live payments.
5. Configure custom domain and HTTPS. Confirm the hosting proxy overwrites `x-real-ip` (the application ignores `x-forwarded-for`), then review metadata, privacy/legal documents, forms, RLS, and admin login. Smoke-test `/en`, `/hi`, admin denial, daily content, and unavailable payment endpoints.

Do not run destructive SQL against production. Deploy by applying additive reviewed migrations first.
