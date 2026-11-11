# JustGive

JustGive is a bilingual (English/Hindi) personal voluntary-contribution website. **It is not a charity, NGO, store, subscription, or investment.** Contributions go to the website owner personally. Giving is optional; no product, service, reward, or financial return is promised.

## Features

- Responsive public website, `/en` and `/hi`, localized legal/disclosure pages, language switching, metadata, sitemap, and robots rules.
- Contribution presets and custom INR amount validation, optional message wall with explicit display consent and moderation, contact form.
- Development-only visibly simulated checkout. Real payments are disabled pending written approval for this exact model from a payment provider.
- Supabase SSR auth foundation, server-enforced administrator role, SQL migrations with RLS, admin overview and message/payment/settings screens.
- Zod validation, security headers, honeypot form fields, local-only rate limit fallback, automated unit tests.

## Stack

Next.js App Router, React, strict TypeScript, CSS design system, Lucide React, Zod, Supabase PostgreSQL/Auth SSR.

## Local development

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` (redirects to `/en`). Without Supabase the public site and local demo checkout still work. The demo never charges or records real money.

## Environment

See `.env.example`. Supabase URL and publishable key are optional for the local public demo. Set those values and apply migrations for Auth, message/contact persistence, and admin pages. Never expose `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, payment secrets, CAPTCHA secrets, or webhook secrets to the browser.

`PAYMENT_MODE=mock` is development only. In production, the application rejects simulation and live payment endpoints remain unavailable. Do not configure a live provider without written business-model approval and a reviewed provider-specific adapter.

## Database

Apply migrations in `supabase/migrations/` using Supabase CLI. See [database setup](./docs/database.md). Provision administrators manually via trusted SQL after creating their Auth users. The sample `supabase/seed.sql` has no fake financial records.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment

Vercel deployment preparation and environment guidance are in [deployment docs](./docs/deployment.md). Do not deploy real payments or claim a bank settlement until provider approval, authoritative webhook verification, and reconciliation are implemented and audited. Legal copy requires professional review before launch; see [launch checklist](./docs/legal-launch-checklist.md).

## Documentation

- [Architecture](./docs/architecture.md)
- [Database and RLS](./docs/database.md)
- [Payment setup and approval gate](./docs/payment-setup.md)
- [Security](./docs/security.md)
- [Deployment](./docs/deployment.md)
- [Legal launch checklist](./docs/legal-launch-checklist.md)
