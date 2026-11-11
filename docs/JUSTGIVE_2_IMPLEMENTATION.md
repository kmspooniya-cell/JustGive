# JustGive 2.0 implementation record

Last reviewed: 2026-11-11

## Follow-up implementation pass

The original audit was rechecked against source before changes. New work is additive; database changes are in migration 6 and are **not deployed or validated against a Supabase project**.

### Completed in source

- Replaced the static kindness visuals with interactive client views. The Universe supports drag panning, wheel/button zoom and reset; the Tree grows and animates leaves, with zoom controls. Both use only the exact verified non-demo aggregate count. Rendering is capped at 360 stars / 240 leaves for browser performance and clearly states when the art is symbolic; no transaction-level or payer data is sent to the client.
- Added public Wall of Kindness pagination in 20-message pages with deterministic ordering, a bounded page number and an extra-row check so the next link appears only when another page exists.
- Added fixed report reason categories and keyed report deduplication using `REACTION_HASH_SECRET`, a unique `(message_id, reporter_hash)` index, and five-report auto-hide. Admins can inspect held content; an authenticated, RLS-checked restore RPC restores an explicitly consented message while preserving its report history. Simple link/repetition/caps cues are advisory only.
- Added a per-admin Gratitude Journal table, strict owner-scoped RLS, Auth-checked GET/POST/PATCH/DELETE handlers, and activity trigger. Journal bodies are not copied into activity log details.
- Added an admin UI/API limited to the two non-sensitive public visualization switches. The homepage reads only those safe public flags; feature-off changes are audited with the setting key and boolean, without arbitrary JSON values.
- Added 192px and 512px PNG PWA icons generated from the existing SVG logo and referenced by the manifest.
- Added a floating accessibility panel for larger text, higher contrast, and reduced-motion preferences, plus a low-volume synthesized ambient tone that starts only after a user click and has an explicit stop control. Preferences are local-device only; audio is never autoplayed.
- Added focused interaction/helper tests for zoom/reset, tree leaf growth cap, advisory moderation cues, and pagination bounds.
- Contribution history remains unavailable. The current contribution schema does not bind a verified payment to a visitor identity or a secure retrieval capability. No transaction-ID lookup, payer PII, or public financial-row access was added. A safe history feature requires a real provider flow that can establish an owner-bound identity or issue a high-entropy expiring capability after verified payment.

### External requirements / blockers

- Apply migrations 1–6 in order to a disposable Supabase project, provision the admin role, and verify grants, policies, report RPC, restore RPC, audit triggers and journal owner isolation before production. No migration has been applied by this work.
- Configure `REACTION_HASH_SECRET`, server-only Supabase credentials, trusted proxy IP forwarding, and shared Redis rate-limit credentials for production report/message/contact/reaction abuse controls.
- Live payment and payer history remain blocked on written payment-provider approval for personal voluntary contributions, provider onboarding/credentials, a reviewed adapter and verified webhook implementation. Demo payment is not production payment.
- Browser visual checks could not be run: no Playwright/Puppeteer package or Chrome/Chromium executable is installed in this environment. CSS responsive rules remain source-reviewed only.
- The offline fallback page remains English-only; full localization and broader admin/API translations remain incomplete.

### Verification for this follow-up

- `npm run lint`: passed.
- `npm test`: passed, 10 files / 26 tests.
- `npm run typecheck`: passed.
- `npm run build`: passed; Next.js compiled and generated all 49 pages/routes, including the new private journal and settings APIs.
- Browser viewport screenshots and real Supabase policy/RPC tests were not run. No browser binary/automation package or Supabase project credentials are available in this environment. Migration 6 remains unapplied.

## Existing architecture audited

- Next.js 16 App Router, React 19, strict TypeScript, localized route tree at `src/app/[locale]`, and locale selection/cookie handling in `src/proxy.ts`.
- English and Hindi copy lives in `messages/en.json` and `messages/hi.json`.
- Public Supabase access uses the publishable key through `@supabase/ssr`; admin pages and write routes verify the Supabase Auth user and the protected `admin_users` table.
- Migration `202611110001_initial_schema.sql` defines admin roles, contributions, payment events, refunds, settlement records, messages/reports, site settings, admin activity, contact submissions, RLS, safe approved-message access, and aggregate public contribution statistics.
- Payment code uses an interface plus a development-only mock provider. `POST /api/payments/create` refuses production requests; no live provider adapter is configured.
- The existing implementation already included disclosures, public message moderation/reporting, contact flow, protected admin views/export, metadata, security headers, manifest, and operational documentation.

## Implementation completed in this pass

- Removed the implicit ₹21 selection. Checkout remains disabled until the visitor chooses a preset or enters a custom amount.
- Added the optional five-state mood selector in English and Hindi. It only changes the contextual message and heart pulse; it never changes or persists payment amount or mood data.
- Added the Kindness Universe and symbolic Kindness Tree to the homepage. They query only `public_contribution_summary()` and display verified, non-demo successful contribution counts. The empty state is used when there are no authoritative records; no simulated activity or private payment fields are exposed.
- Added an additive `daily_moments` migration with bilingual content, scheduled publishing, least-privilege RLS, admin-only writes, and activity audit trigger.
- Added server-authorized admin entry for daily moments and a public homepage slot that renders only published content whose scheduled time has passed.
- Added tests for the no-preselection rule and mood behavior.
- Completed a source-by-source requirement audit in `docs/JUSTGIVE_2_AUDIT.md`, including concrete gaps, unsafe paths, and external prerequisites.
- Closed the direct Supabase write bypass in source by adding migration 3 and moving message/contact/report writes to a server-only privileged client after validation and rate limiting. **This protection is not active in a hosted project until migration 3 is applied and the server-only Supabase key is configured.**
- Replaced client-controlled `x-forwarded-for` bucketing with the hosting-proxy `x-real-ip` header and added focused tests. Hosting must overwrite this header; otherwise requests share an `unknown` bucket.
- Added a production service worker and offline fallback page. Only `/offline.html` is cached; no page/API/admin/payment data is cached. The offline copy is English-only and the manifest does not yet include raster 192px/512px icons.
- Added optional appreciation reactions for approved public messages, with an RLS-hidden visitor hash table, unique `(message_id, visitor_hash)` constraint, aggregate count trigger, server-only API, and English/Hindi control. The hash combines the trusted proxy IP, user-agent, and `REACTION_HASH_SECRET`; it prevents ordinary duplicate clicks but is not a durable identity/anti-abuse guarantee.
- Added migration 4 for appreciation counts/table and included the limited retention purpose in both privacy-policy locales.
- Added a private contact inbox and authenticated status updates; migration 5 records read/closed status changes in the administrator activity log.

## Baseline verification before the follow-up pass

- `npm run lint`: passed.
- `npm test`: passed, 6 files / 18 tests.
- `npm run build`: passed; Next.js compiled and generated 45 pages/routes.
- `npm run typecheck`: passed after the production build completed.
- Browser viewport inspection: unavailable unless a browser or screenshot runtime is provided in this environment.
- Supabase migration/RLS integration test: not run; no Supabase project credentials are configured.

## Remaining work and external dependencies (baseline before the follow-up pass)

- Live checkout, authoritative provider verification, idempotent webhook settlement, private payment history, and provider refunds require a provider whose written approval explicitly covers this personal contribution model, provider-specific implementation, credentials, and a configured Supabase project. Do not enable live payments before those prerequisites.
- Apply migrations 1–5 to a disposable Supabase project and test policies/RPCs before production. Migration 2 can be rolled back by dropping its trigger, policy, index, and `daily_moments` table after confirming no content needs preservation. Migration 3 must be applied before considering direct public writes closed. Set `REACTION_HASH_SECRET` before enabling reactions.
- Add service-backed reaction de-duplication, contact delivery, CAPTCHA, shared Redis rate limiting, and deeper admin audit coverage before public launch.
- Obtain legal/tax review and configure verified owner contact details, domain, production secrets, and hosting.

## Deployment checklist

1. Configure Supabase URL and publishable key, the server-only Supabase secret/service-role key and `REACTION_HASH_SECRET`, apply migrations 1–6 in order, configure Auth URLs, and provision admin UUIDs using trusted SQL.
2. Configure production domain/HTTPS, support contact, Redis rate-limit service, and CAPTCHA if enabled; keep secrets in server-side hosting settings.
3. Verify public and admin RLS behavior in a disposable project, then smoke-test `/en`, `/hi`, content publishing, message moderation, and unauthenticated admin denial.
4. Keep payment endpoints unavailable in production until written provider approval, provider adapter, signature/webhook/idempotency tests, refund handling, reconciliation, and legal review are complete.
5. Run lint, typecheck, tests, production build, and deployment smoke checks on the exact release commit.
