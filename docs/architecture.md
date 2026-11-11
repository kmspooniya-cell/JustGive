# Architecture

JustGive is a Next.js App Router application. Public pages are React Server Components under `src/app/[locale]`; the amount selector and demo checkout are small Client Components. `src/proxy.ts` sends unprefixed routes to English and keeps `/en` and `/hi` paths explicit. API Route Handlers validate all writes.

Supabase is optional for local design/demo use. The SSR helper uses `@supabase/ssr` cookies and the publishable key. Private writes and admin identity are enforced by Supabase RLS. Production financial writes are reserved for a future server-only verified provider adapter; browser success callbacks never settle a contribution.

Current scope: mock checkout is a development simulation and does not persist financial records. The public aggregate page remains empty until verified, reconciled production data is available. Redis CAPTCHA and live email/payment delivery require configured services.
