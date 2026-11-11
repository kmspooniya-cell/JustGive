# JustGive Project Guide

## Architecture
- Next.js App Router, strict TypeScript, React Server Components by default.
- Localized public pages live under `src/app/[locale]`; translations are JSON in `messages/`. Next.js 16 `src/proxy.ts` chooses the language URL and persists its cookie.
- Route handlers validate inputs and own payment state transitions. Supabase is optional locally and configured through server-only environment variables.
- SQL migrations under `supabase/migrations` are the source of truth. Public access is default-deny; never use service credentials in browser code.

## Commands
- `npm run dev` — local development (demo payments only).
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` — quality checks.

## Conventions
- TypeScript strict mode, semantic HTML, accessible labels, server components unless interactivity requires a client component.
- Keep user-facing text in locale messages; English and Hindi disclosures must stay equivalent.
- INR amounts are integer paise internally; validate both client and server.

## Security and database rules
- Validate all untrusted input with Zod; rate-limit public write endpoints.
- Treat browser redirects as untrusted. Only verified signed provider events may settle payments.
- Mock payments are development-only and always labeled simulated. Never activate live payments without written provider approval for this personal contribution model.
- Do not expose secrets or private payment records. Enable RLS on every exposed table and use narrow policies.
- Admin checks must use verified Supabase Auth identity plus a protected database role table, never user-editable metadata.

## Payment rules
- No direct UPI/bank transfer workaround and no client-side payment credentials.
- Live provider adapter remains disabled until provider-specific approval and credentials are configured.
- Record webhook events idempotently; preserve payment and refund audit trails.

## Definition of done
- Bilingual responsive public experience, contribution demo, moderation and contact flows, admin surfaces, migrations/RLS, security docs, tests, lint/typecheck/build checked, secrets excluded.
