# JustGive master specification audit

Audit date: 2026-11-11. Scope: checked the actual routes, React components, payment modules, migration SQL, API handlers, translation files, tests, and operational docs against `JUSTGIVE_MASTER_PROMPT.md`. Statuses below describe source behavior; they do not imply that migrations were applied or external services were tested.

## 1. Fully implemented (source-level)

- Next.js App Router with localized `/en` and `/hi` routes, locale cookie/proxy, translations, metadata, sitemap, robots, responsive navigation, and Ocean Breeze teal/coral/mint design tokens. A custom inline SVG logo is shared by the header; app icon and manifest exist.
- Accessible SVG animated heart with pulse/orbit CSS, contribution-change pulse, reduced-motion CSS, semantic labels, and keyboard focus styles. The drawing has an explicit viewBox and source-level layout sizing.
- Preset/custom INR input validation (server-side amount schema uses integer paise and ₹1–₹100,000 limits); payment CTA requires a chosen amount. Mood selection is optional, bilingual, in-memory only, and cannot select an amount.
- Clear personal voluntary-contribution disclosures and development-only labeled simulated checkout. Production order-creation and demo completion endpoints return unavailable/not found.
- Anonymous-by-default message submission, explicit publication consent, pending moderation, approved-only public message view, reporting and appreciation controls, admin moderation, API rate limiting, and duplicate appreciation protection.
- Supabase Auth plus `admin_users` authorization checks on admin routes; RLS is enabled on tables in migration 1. Financial records are not publicly selectable; public statistics are an aggregate RPC that excludes demo payments.
- Contact/message/report/payment-order API inputs use Zod and API-level rate limiting. Production rate limiting fails closed if the Redis-compatible service is missing.
- Migration 2 adds scheduled bilingual daily moments with RLS, admin-only writes, public published-content reads, an admin form/API, and homepage rendering after scheduled time.
- Migration 4 adds appreciation counts and a private reaction identity table with a unique message/visitor constraint; only approved consented messages can be appreciated, and visitor hashes are never publicly readable.
- Interactive homepage Universe/Tree consume only the aggregate successful non-demo contribution count; no sample activity or contributor identity is fabricated. Counts are stated exactly while decorative rendering is intentionally bounded (360 stars / 240 leaves).
- Security response headers, a baseline CSP, legal/security/payment/deployment docs, and safe environment-variable examples exist.
- A network-only offline fallback worker caches only `offline.html`; API, admin, checkout, payment status, and public pages are never cached.
- Migration 3 and current API code revoke/avoid direct public Supabase writes for messages, contacts, and reports. The server-only privileged client is used only after route validation/rate limiting.
- Owner-only contact inbox and status updates exist; migration 5 records status changes in the admin activity log.

## 2. Partially implemented

- Ocean Breeze glass UI: shared glass components and styling exist, but the CSS still contains legacy placeholder/neutral styling and repeated dark-mode rules; no screenshot-based viewport review was possible. The full 360–1440px matrix has not been tested.
- Signature identity: header logo, icon, favicon route, and manifest exist; footer/loading/admin usage is not a consistent reusable logo component. Manifest only references SVG and does not provide full platform icon sizes.
- Heart interaction: heartbeat/orbits/amount pulse exist. Mouse/touch response, configurable movement, and explicit clipping tests are absent.
- Thank-you: development demo status exists and is labeled simulated. There is no verified payment reference, contribution lookup, downloadable card, or verified-payment gratitude flow.
- Kindness Universe/tree: zoom and pan controls, wheel zoom, reset, twinkle/sway motion, and accessible aggregate labeling are implemented. Decorative point caps mean the art is symbolic at high totals; exact count remains separate. The points do not reveal transaction identities.
- Moments/wall: anonymous text, consent, moderation, reporting with fixed reason categories, and appreciation exist in source. Wall pagination is implemented with bounded 20-item pages. Reporting deduplicates by keyed visitor hash; five unique reports auto-hide a published item and admins can review/restore it. Advisory spam cues are text-only and never auto-approve/reject. No AI moderation is configured.
- Daily content: scheduled per-locale posts can be created and published, but no paired-language workflow, edit/unpublish UI, preview, or scheduling test exists.
- Admin: overview, payment/refund/message/report/contact/daily-content/settings/activity pages and CSV export exist behind server-side identity checks. Two safe visual settings are editable; a private per-admin Gratitude Journal uses Auth and owner RLS. Settings, message moderation, report holds, and journal writes have audit triggers. Other admin mutations may still lack complete audit coverage; analytics use capped row queries. Hindi admin coverage remains incomplete outside the new journal.
- SQL: contributions/events/refunds/settlement schema and aggregate function exist, but no atomic verified payment transition or webhook event persistence exists. Migration 6 adds visual settings access, report deduplication/auto-hide/restore and private journal/audit protections. Migrations 1–6 have not been applied to a live/disposable database here.
- Message/contact rate limiting: route-level limits exist; migration 3 must be applied to remove the prior direct-write bypass. CAPTCHA, contact notification/delivery, and durable shared limiting depend on production Redis configuration.
- PWA: manifest, production service worker, offline page, and raster 192/512 icons exist. Offline fallback remains English-only.
- Accessibility: an interactive panel now exposes persistent larger-text, contrast, and reduced-motion preferences; ambient synth audio is explicit opt-in and has a mute/stop path. Automated screen-reader/axe checks remain absent.
- Testing: 8 test files / 23 tests cover selected form/mood, validation, report/appreciation controls, trusted IP selection, demo store, interactive visual controls, moderation cues, and pagination bounds. No RLS integration, admin auth, webhook idempotency, refunds, responsive browser tests, or end-to-end suite.

## 3. Missing

- Live hosted checkout, provider-specific signature and webhook verification, authoritative provider status retrieval, idempotent event storage, settlement/reconciliation, atomic financial status transition, and live refund execution.
- Secure contribution history, refund request flow and visitor-visible refund status, and accurate verified payment reference/thank-you card/share/download experience.
- Reporting-reason form and richer triage workflows; optional AI-assisted moderation with human review.
- Broader editable site configuration; payment-event/reconciliation administration; broad audit coverage.
- Authenticated private contribution history. The schema currently has no payer-owner identity/capability that can safely resolve a visitor to a verified contribution; do not add a lookup by transaction ID or expose provider IDs. Design remains blocked on an approved provider flow and secure ownership mechanism.
- One-record-one-star/leaf rendering at arbitrary scale; the current bounded rendering uses a symbolic cap and exact aggregate count.
- Full localization of all admin/API errors and localized payment, moderation, and empty states across every route.
- Full localization of all admin/API errors and localized payment, moderation, and empty states across every route.
- A real provider adapter and integration/RLS tests. No credentials or user data exist to test against here.

## 4. Broken or insecure findings

1. **Public write bypass remediation is implemented but requires migration 3.** Migration 1 grants `anon` direct insert on `messages` and `contact_messages`, and grants `anon` execution of `report_public_message(uuid)`. Migration 3 revokes those privileges; current API routes now use the server-only Supabase secret/service-role key after validation/rate limiting. Until migration 3 is applied, bypass remains possible in the configured project.
2. **Rate-limit address depends on proxy configuration.** The app now ignores `x-forwarded-for` and uses only `x-real-ip`; production hosting must overwrite that header or requests share the `unknown` bucket.
3. **Payment webhook is a stub.** It only asks the provider adapter to verify a signature and returns `{received:true}`; it does not parse/persist event identity or settle a payment. There is no production adapter, so it cannot process live payment events.
4. **Daily moments, server-write, appreciation, and contact-audit migrations depend on migration 1.** Apply migrations in numeric filename order. The database policies/RPCs have not been validated against a real Postgres/Supabase instance.
5. **Rendered browser layout has not been inspected.** No browser automation package or Chrome/Chromium executable is present in this environment. Source-level responsive styles and production build can be checked, but no viewport capture has been made.

No live payment credentials are present in source or docs. The production contribution endpoint is gated off, which is the correct safe behavior until provider approval and implementation exist.

## 5. External credentials / approvals / actions required

- Supabase project URL and publishable key; a server-only secret/service-role key for rate-limited writes; `REACTION_HASH_SECRET`; apply migrations 1–6; create an Auth user and provision its UUID in `admin_users` using trusted SQL.
- Written approval from the selected payment provider for this exact personal voluntary contribution business model, account ownership, and use in India, plus provider merchant onboarding/KYC and server-side API/webhook credentials. The selected provider is not specified, so availability/approval cannot be verified without that choice.
- Production hosting/domain/HTTPS, `NEXT_PUBLIC_SITE_URL`, Redis-compatible rate-limit service and credentials, and optional CAPTCHA credentials; ensure trusted proxy IP handling.
- Support email/contact delivery service, privacy/data-retention decisions, professional Indian legal/tax/FCRA review, and production smoke checks.
- A disposable Supabase project is needed for real RLS/RPC integration. A browser automation/runtime is needed for viewport/accessibility verification.

## Implementation follow-up

Live payment features remain intentionally unavailable until the external provider gate is satisfied; fabricating an adapter or claiming a webhook works would create financial risk. Migration 3 is additive but must be applied before the public write paths are considered protected against direct-client bypass.
