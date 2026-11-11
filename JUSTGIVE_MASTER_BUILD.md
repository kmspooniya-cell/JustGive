MASTER BUILD PROMPT — JUSTGIVE

Autonomous Full-Stack Website Development

You are the lead full-stack engineer, UI/UX designer, database architect, security engineer, QA engineer, and deployment engineer responsible for building a complete production-oriented website called JustGive.

Your task is to BUILD THE ACTUAL APPLICATION inside the currently open GitHub repository.

Do not merely explain how to build it. Do not stop after producing a plan, mockup, wireframe, or homepage. Inspect the repository, implement the application, run it, test it, fix errors, and prepare it for deployment.

Work autonomously until all tasks that can be completed with the available tools and credentials are finished.

If an external credential, account approval, or legal approval is required, implement everything possible around that dependency and clearly identify the exact remaining action. Never fabricate credentials, successful payments, approvals, or deployment results.

---

1. PRODUCT VISION

Product name: JustGive

Brand tagline:
Give Freely. Feel Good. Repeat.

Hindi tagline:
अपनी खुशी से दें। सुकून महसूस करें।

Website concept:

JustGive is a voluntary personal-contribution platform.

Visitors can voluntarily send money to the website owner simply because they wish to experience the satisfaction of giving.

The platform does not sell products, subscriptions, memberships, financial investments, or paid services.

There is:

- No compulsory contribution.
- No purchase requirement.
- No promised financial return.
- No rewards or prizes for contributing.
- No compulsory registration for visitors.
- No compulsory public identity.
- No automatic recurring payments.

The recipient is the website owner personally, not a charity or NGO.

Clearly disclose this throughout the website.

Initial market: India.

Currency: INR (₹).

Languages:

- English
- Hindi

Public contributors should appear anonymous.

Important privacy distinction: contributors may be anonymous publicly, but payment providers, banks, and legally authorized parties may collect transaction and identity information.

Never promise anonymity from payment providers or authorities.

---

2. FIRST ACTION: REPOSITORY INSPECTION

Before changing files:

1. Inspect the complete repository.
2. Identify existing framework, dependencies, scripts, and directory structure.
3. Inspect package.json, existing configuration, README, and AGENTS.md.
4. Identify whether this is an empty repository, partially implemented project, or existing Next.js application.
5. Preserve useful existing work.
6. Do not overwrite working configuration unnecessarily.
7. Identify missing dependencies and install only what is needed.

If an existing implementation is incomplete, improve it rather than blindly recreating the project.

Create or update a root AGENTS.md containing:

- Project architecture.
- Development commands.
- Code conventions.
- Security requirements.
- Database rules.
- Payment implementation rules.
- Testing requirements.
- Definition of done.

Then create a practical implementation checklist and execute it.

Do not stop after writing the checklist.

---

3. TECHNOLOGY STACK

Use stable, mutually compatible versions and verify them against official documentation.

Frontend:

- Next.js App Router
- React
- TypeScript strict mode
- Tailwind CSS
- Lucide React icons
- Server Components by default
- Client Components only where interactivity requires them

Backend:

- Next.js Route Handlers
- Supabase PostgreSQL
- Supabase Auth for administrators
- Supabase SSR integration
- Supabase Row Level Security
- Zod validation

Deployment:

- GitHub
- GitHub Codespaces for development
- Vercel for hosting
- Supabase for database and authentication

Payments:

- Provider-independent payment adapter.
- Mock payment provider for development.
- Hosted checkout integration only for a payment provider that explicitly approves this exact personal voluntary-contribution business model.

Use the official current Next.js and Supabase documentation.

Do not use deprecated authentication or routing patterns.

---

4. BRAND IDENTITY AND DESIGN SYSTEM

Create a premium, creative, colorful, friendly, and trustworthy visual identity.

Brand personality:

- Positive
- Human
- Creative
- Playful but professional
- Transparent
- Minimalist
- Trustworthy

Color palette:

Primary Ocean Teal: #087F8C
Deep Ocean: #173C42
Dark Teal: #105E65
Soft Mint: #B8F0DF
Pale Mint: #E7F8F1
Warm Champagne: #FFF5E8
Coral Accent: #FF8B78
Soft Peach: #FFE1D8
Crystal White: #FFFFFF
Muted Text: #718487

Dark theme:
Deep Ocean background (#173C42) with accessible mint and white text.

Typography:

- Inter for English.
- Noto Sans Devanagari for Hindi.
- Use locally bundled fonts or optimized font loading.

UI characteristics:

- Rounded cards.
- Soft shadows.
- Gradient backgrounds.
- Beautiful typography.
- Generous whitespace.
- Smooth transitions.
- Subtle floating decorative elements.
- Beautiful hover states.
- Carefully designed mobile navigation.
- Accessible contrast.
- Responsive layouts.
- Reduced-motion support.

Avoid generic dashboard-template aesthetics.

Do not create an excessively complicated interface.

The contribution form should be the central visual element of the homepage.

Build reusable design components and consistent spacing, colors, radii, and typography.

Use CSS and SVG for decorative visuals rather than unnecessary heavy image dependencies.

---

5. COMPLETE PUBLIC WEBSITE

Implement all of the following routes.

Homepage /

Sections in this order:

1. Navigation bar.
2. Hero section.
3. Contribution amount selector.
4. Custom amount input.
5. Why JustGive section.
6. How it works.
7. Wall of Kindness preview.
8. Verified transparency statistics.
9. Frequently asked questions.
10. Footer.

Hero copy:

English:
"A little giving. A little happiness."

"Give because you want to. No purchase, no pressure, no rewards. Just the joy of giving."

Hindi:
"थोड़ा सा देना। थोड़ी सी खुशी।"

"अपनी इच्छा से योगदान दें। न कोई खरीदारी, न दबाव, न इनाम। सिर्फ देने की खुशी।"

Main CTA:
"Give with happiness"

Hindi:
"खुशी से योगदान दें"

Contribution presets:
₹1, ₹5, ₹10, ₹21, ₹51, ₹101.

Also provide a custom amount input.

Initial configurable amount limits:
Minimum: ₹1.
Maximum: ₹1,00,000.

These are application-level defaults, not a guarantee that every payment provider permits those amounts.

Validate amounts on both client and server.

Use integer paise internally.

Never display fake collection figures.

If no verified payment statistics exist, display a meaningful empty state instead of invented statistics.

/about

Explain:

- What JustGive is.
- Why it exists.
- Who receives the money.
- Why contributions are voluntary.
- What contributors receive: a payment confirmation and thank-you experience, not a purchased service or reward.

/how-it-works

Explain:

1. Choose an amount.
2. Review the voluntary payment disclosure.
3. Complete payment through the approved payment provider.
4. Receive payment confirmation.
5. The contributor can leave an optional message.

/wall-of-kindness

Create an anonymous message wall.

Requirements:

- Optional message.
- Maximum 300 characters.
- English and Hindi support.
- Explicit separate consent before public display.
- Moderation required before publishing.
- Report inappropriate messages.
- Rate limiting.
- Spam protection.
- No public personal information.
- No automatically published messages.

Messages can be submitted without revealing a public identity.

/transparency

Display only verified information.

Include:

- Successful contribution total.
- Number of successful transactions.
- Payment gateway fees, where reliably available.
- Refund totals.
- Net settlements, only when supported by reconciled settlement data.
- Last updated time.

Distinguish clearly between:

- Gross successful payments.
- Refunds.
- Gateway fees.
- Net bank settlements.

Never assume the payment amount equals the amount received in the owner's bank account.

Do not fabricate figures.

/contact

Create a contact page with validated form, anti-spam protection, and a configurable official support email.

Never invent an email address.

Legal routes

Create:

- /privacy
- /terms
- /refund-policy
- /payment-disclosure

Use clear, understandable English and Hindi content.

Mark legal content as requiring professional review before production launch.

Do not claim charitable, NGO, 80G, tax-deductible, or FCRA-approved status.

---

6. BILINGUAL ARCHITECTURE

Implement proper English/Hindi internationalization.

Routes:

/en/...
/hi/...

Use a robust locale architecture with:

- English default.
- Hindi translation.
- Persistent language preference.
- Language switcher in header and mobile menu.
- Localized metadata.
- Localized error messages.
- Localized validation.
- Localized checkout disclosure.
- Localized thank-you screen.
- Localized legal pages.

Store translation files separately.

Suggested files:

messages/en.json
messages/hi.json

Avoid hardcoding user-visible strings inside reusable components.

Do not use machine-generated untranslated placeholders for essential legal disclosures.

---

7. CONTRIBUTION EXPERIENCE

Build a complete, polished contribution form.

Features:

- Preset amounts.
- Custom amount.
- INR formatting.
- Amount validation.
- Anonymous public identity by default.
- Optional message.
- Optional public-display consent.
- Clear recipient disclosure.
- Clear voluntary nature disclosure.
- Payment fee disclosure when applicable.
- Continue button.
- Checkout review.
- Payment pending state.
- Payment successful state.
- Payment failed state.
- Payment cancelled state.
- Refund status.

Do not require an account to contribute.

Do not store unnecessary personal information.

Do not collect card or UPI credentials directly.

Use a payment provider's hosted checkout.

Prevent double submission.

Provide loading and error states.

If the payment provider is not configured or approved, display an explicit demo-mode message and never represent a simulated payment as real money received.

---

8. SUPABASE DATABASE

Create complete SQL migrations under:

supabase/migrations/

Required tables:

1. contributions
2. payment_events
3. refunds
4. messages
5. site_settings
6. admin_activity
7. contact_messages

Use UUID primary keys.

Use timestamptz for timestamps.

Use BIGINT amount_paise.

Currency must default to INR.

Use database constraints for valid payment states.

Suggested contribution states:

created
pending
successful
failed
refunded
partially_refunded

Store:

- Internal order ID.
- Provider.
- Provider order ID.
- Provider payment ID.
- Amount in paise.
- Currency.
- Payment status.
- Created timestamp.
- Verified paid timestamp.
- Refund status.
- Reconciliation information where available.

Use appropriate foreign keys and unique constraints.

Database security

Enable RLS on every exposed table.

Default-deny public access to:

- Contributions.
- Payment events.
- Refund records.
- Admin activity.
- Site settings containing private information.

Public users must never be allowed to:

- Mark payments successful.
- Change payment amounts.
- Modify provider IDs.
- Access private transaction records.
- Read admin information.
- Update settlement data.

Use narrowly scoped server-side operations.

Use Supabase service-role or secret credentials only on the server.

Never expose privileged credentials in browser bundles.

Create an admin authorization strategy based on verified Supabase Auth users and an administrator role stored securely.

Do not trust user-editable metadata as an administrator authorization source.

Protect every admin API and page on the server.

Use explicit SQL policies.

Do not create permissive policies such as USING (true) on private financial tables.

For public statistics, use a carefully restricted database view or server-side aggregate query that reveals only approved aggregate values.

For messages, expose only approved and consented public messages.

Add indexes for payment status, creation time, provider IDs, and commonly queried fields.

Use database migrations rather than undocumented manual schema changes.

Create a seed script with clearly labeled demo data for development only.

Never allow demo data into production reporting.

---

9. PAYMENT ARCHITECTURE

THIS SECTION IS CRITICAL.

The business model is personal voluntary contributions, not a conventional online store.

Payment providers may restrict donations, personal fundraising, or voluntary contributions.

Do not assume that Razorpay, Cashfree, or any other provider approves this activity.

Do not activate real payments without written provider approval for the exact business model and account structure.

Build a provider-independent payment architecture.

Suggested structure:

src/lib/payments/

- types.ts
- provider.ts
- mock-provider.ts
- approved-provider.ts
- payment-service.ts
- verification.ts

Implement a PaymentProvider interface with methods for:

- createOrder
- verifyPayment
- verifyWebhook
- fetchPaymentStatus
- initiateRefund

Build a working MockPaymentProvider for development.

The mock provider must be visibly identified as a simulation.

Mock payments must never appear in production financial statistics.

Production payment flow

1. Visitor selects amount.
2. Server validates amount.
3. Server creates internal contribution record.
4. Server creates provider order through the approved provider adapter.
5. Visitor is redirected to hosted checkout.
6. Provider processes payment.
7. Provider sends signed webhook.
8. Server verifies webhook signature against the raw request body.
9. Server retrieves or verifies the authoritative transaction status.
10. Server confirms provider order ID, payment ID, amount, currency and final status.
11. Server atomically updates contribution status.
12. Server records the webhook event idempotently.
13. Visitor sees success only after server verification.

Implement:

- Signature verification.
- Webhook idempotency.
- Duplicate-event prevention.
- Transaction locking or safe concurrency handling.
- Payment status reconciliation.
- Refund processing.
- Failed payment handling.
- Pending payment recovery.
- Audit logging.

Never trust a client-side success redirect.

Never mark a contribution successful solely because the browser reports success.

Do not implement a direct personal UPI QR or bank-transfer shortcut as a workaround for a provider's restrictions.

If provider approval is unavailable:

- Keep payment mode disabled in production.
- Keep mock payment available only in development.
- Display a clear payment-unavailable notice.
- Complete all other website features.
- Document the provider approval requirement.

Use separate development and production environment variables.

---

10. REFUNDS AND FINANCIAL RECONCILIATION

Create a refund system.

Track:

- Original contribution.
- Refund amount.
- Refund ID.
- Provider refund ID.
- Refund status.
- Refund timestamp.
- Reason.
- Initiating administrator.
- Provider response.

Support full and partial refunds where the approved provider supports them.

Never delete successful payment records.

Never overwrite payment history without preserving an audit trail.

Create an admin reconciliation view comparing:

- Successful provider payments.
- Refunds.
- Provider fees.
- Settlement records.
- Actual net settlement data.

Do not claim a bank settlement occurred unless actual settlement information is available.

---

11. ADMIN DASHBOARD

Create a private dashboard under /admin.

Features:

Admin authentication

- Supabase Auth.
- Secure session cookies.
- Server-side authorization.
- Protected routes.
- Logout.
- No hardcoded credentials.
- No public admin registration.

Dashboard overview

Show:

- Total verified successful contributions.
- Successful transaction count.
- Average contribution.
- Gross collected amount.
- Refund amount.
- Gateway fees.
- Net settlement amount when available.
- Pending transactions.
- Failed transactions.

Provide daily, weekly, monthly and custom date filters.

Payments

Admin can:

- View transaction records.
- Search by internal order ID.
- Search by provider transaction ID.
- Filter by status.
- View payment timestamps.
- View refunds.
- Export authorized financial reports to CSV.

Never expose payment secrets or unnecessary personal data.

Messages

Admin can:

- View pending messages.
- Approve messages.
- Reject messages.
- Remove published messages.
- Review reported messages.

Settings

Admin can configure:

- Website name.
- Tagline.
- English and Hindi content.
- Suggested contribution amounts.
- Amount limits.
- Maintenance mode.
- Public statistics visibility.
- Message wall visibility.
- Payment mode.
- Support contact.

Never allow an admin UI setting to bypass payment-provider approval.

Activity log

Record:

- Admin login events where appropriate.
- Payment-related administrative actions.
- Refund initiation.
- Content moderation.
- Configuration changes.

---

12. SECURITY REQUIREMENTS

Implement production-quality security.

Requirements:

- Secure HTTP headers.
- Content Security Policy appropriate to actual integrations.
- Input validation with Zod.
- Output escaping.
- XSS prevention.
- CSRF protection where required.
- Server-side authorization.
- Rate limiting.
- CAPTCHA integration configurable for public forms.
- Secure cookies.
- No secrets in frontend code.
- No sensitive data in logs.
- Webhook signature verification.
- Idempotent payment operations.
- Safe error messages.
- Database RLS.
- Dependency auditing.
- Protection against duplicate requests.
- Safe environment validation.
- Admin session protection.

Use a maintained rate-limiting solution appropriate for serverless deployment, such as Upstash Redis, if required.

Provide a local fallback only for development.

Never silently claim production-grade distributed rate limiting if only an in-memory implementation exists.

Use privacy-conscious analytics.

Do not install unnecessary tracking scripts.

---

13. SEO AND PERFORMANCE

Implement:

- Page-specific metadata.
- Open Graph metadata.
- Sitemap.
- robots.txt.
- Canonical URLs.
- Favicon.
- Manifest where appropriate.
- Semantic HTML.
- Accessible forms.
- Keyboard navigation.
- Screen-reader labels.
- Responsive images.
- Lazy loading.
- Optimized font loading.
- Minimal JavaScript.
- Error boundaries.
- Loading states.
- Not-found page.

Use proper Hindi and English metadata.

Aim for excellent Lighthouse performance, accessibility, SEO and best practices.

Do not compromise security to improve scores.

---

14. PROJECT STRUCTURE

Use a clean, maintainable structure similar to:

src/
app/
[locale]/
page.tsx
about/
how-it-works/
transparency/
wall-of-kindness/
contact/
privacy/
terms/
refund-policy/
payment-disclosure/
checkout/
payment-status/
admin/
login/
dashboard/
payments/
refunds/
messages/
reports/
settings/
api/
payments/
messages/
contact/
admin/
components/
layout/
home/
contribution/
checkout/
admin/
ui/
lib/
supabase/
payments/
auth/
validation/
security/
i18n/
analytics/
messages/
en.json
hi.json
types/
hooks/

supabase/
migrations/
seed.sql

tests/
unit/
integration/
e2e/

docs/
architecture.md
database.md
payment-setup.md
deployment.md
security.md
legal-launch-checklist.md

Adapt the structure to the actual Next.js version and framework conventions.

Avoid unnecessary abstractions.

---

15. TESTING

Write real tests.

Use suitable current versions of:

- Vitest or Jest.
- React Testing Library.
- Playwright for end-to-end tests.

Test:

Contribution tests

- Preset amount selection.
- Custom amount.
- Minimum amount.
- Maximum amount.
- Invalid decimal values.
- Invalid input.
- Anonymous default.
- Language switching.

Payment tests

- Order creation.
- Mock checkout.
- Failed payment.
- Pending payment.
- Successful mock payment.
- Invalid webhook signature.
- Duplicate webhook.
- Wrong amount.
- Wrong currency.
- Unknown order.
- Duplicate payment.
- Refund.
- Partial refund.

Security tests

- Anonymous access denied to private records.
- Anonymous cannot modify payment status.
- Unauthorized admin denied.
- Authenticated non-admin denied.
- Approved messages only are publicly visible.
- Public statistics do not leak transaction records.

UI tests

- Mobile navigation.
- Desktop layout.
- Checkout states.
- Empty states.
- Hindi content.
- English content.
- Accessibility basics.

---

16. ENVIRONMENT CONFIGURATION

Create .env.example.

Include documented placeholders for:

NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY (only if required by the selected SDK/version; never expose publicly)

PAYMENT_MODE
PAYMENT_PROVIDER
PAYMENT_SECRET_KEY
PAYMENT_WEBHOOK_SECRET

RATE_LIMIT configuration if required.

CAPTCHA configuration if enabled.

Never create real credentials.

Never print secret values.

Never commit .env.local or any production secret.

Validate required variables at startup.

Provide a clear error if an integration is unconfigured.

The project must still run in local demo mode without real payment credentials.

---

17. DOCUMENTATION

Create complete documentation:

README.md:

- Product overview.
- Features.
- Technology stack.
- Installation.
- Local development.
- Environment setup.
- Database setup.
- Testing.
- Build.
- Deployment.

docs/architecture.md:

- System architecture.
- Component relationships.
- Server/client boundaries.

docs/database.md:

- Database schema.
- RLS rules.
- Migrations.
- Admin setup.

docs/payment-setup.md:

- Provider-independent architecture.
- Provider approval requirements.
- Sandbox configuration.
- Webhook setup.
- Production activation steps.

docs/deployment.md:

- GitHub setup.
- Codespaces development.
- Vercel deployment.
- Supabase configuration.
- Domain and HTTPS.

docs/security.md:

- Secret management.
- Authentication.
- Authorization.
- Webhook security.
- Data privacy.

docs/legal-launch-checklist.md:

- CA consultation.
- Payment provider written approval.
- Applicable Indian tax treatment.
- FCRA assessment for foreign contributions.
- Privacy policy review.
- Terms and refund policy review.

---

18. DEPLOYMENT

Prepare the website for deployment to Vercel.

Create:

- Production build configuration.
- Environment variable documentation.
- Supabase migration instructions.
- Domain configuration instructions.
- HTTPS requirements.
- Production smoke-test checklist.

Do not automatically publish to production or enable live payments.

Do not run destructive database commands against an existing production database.

Do not modify GitHub repository visibility or overwrite branches without explicit permission.

Never deploy secrets into client-side configuration.

---

19. AUTONOMOUS EXECUTION RULES

You must work as an autonomous coding agent.

Follow this process:

1. Inspect repository.
2. Check official documentation for relevant current APIs.
3. Create AGENTS.md.
4. Implement architecture.
5. Implement public website.
6. Implement bilingual support.
7. Implement contribution experience.
8. Implement database migrations.
9. Implement RLS.
10. Implement authentication.
11. Implement admin dashboard.
12. Implement mock payment adapter.
13. Implement provider integration interface.
14. Implement message moderation.
15. Implement refund and reconciliation logic.
16. Implement tests.
17. Run lint.
18. Run TypeScript checks.
19. Run tests.
20. Run production build.
21. Fix every discovered error.
22. Review security.
23. Update documentation.
24. Verify Git status.

Do not stop after completing one phase.

Do not ask the user to manually create files that you can create yourself.

Do not provide large code snippets instead of actually editing files.

Do not use placeholder components for essential features.

Do not use hardcoded fake financial statistics.

Do not claim features work if they are only visual mockups.

If credentials are missing, build a safe configurable implementation and document exactly what is blocked.

If a command fails:

- Read the error.
- Identify the root cause.
- Correct it.
- Retry.
- Do not hide failures.

If the context becomes limited, preserve progress in a project execution document and continue from the last verified state.

Maintain a task checklist in the repository.

Prefer small, understandable modules and reusable components.

Use parallel work only for independent tasks where it improves quality.

Do not waste time on unnecessary preambles or repeated plans.

---

20. DEFINITION OF DONE

The project is complete only when the following are verified:

[ ] Homepage works.
[ ] English language works.
[ ] Hindi language works.
[ ] Language switching works.
[ ] Responsive mobile layout works.
[ ] Responsive desktop layout works.
[ ] Contribution presets work.
[ ] Custom amount works.
[ ] Amount validation works.
[ ] Anonymous public identity works.
[ ] Checkout demo works.
[ ] Payment pending state works.
[ ] Payment failure state works.
[ ] Mock payment success is clearly identified as simulated.
[ ] Supabase migrations exist.
[ ] RLS policies are implemented.
[ ] Admin authentication works when configured.
[ ] Admin authorization is server-enforced.
[ ] Admin dashboard works.
[ ] Contribution management works.
[ ] Message moderation works.
[ ] Transparency page uses real verified data only.
[ ] Refund architecture is implemented.
[ ] Payment webhook verification is implemented in the adapter architecture.
[ ] Duplicate webhook protection works.
[ ] Security tests pass.
[ ] Unit tests pass.
[ ] Integration tests pass where configured.
[ ] Lint passes.
[ ] TypeScript checks pass.
[ ] Production build passes.
[ ] Documentation is complete.
[ ] .env.local and secrets are excluded from Git.
[ ] Deployment configuration is prepared.

Some production integrations may remain gated by external approval or credentials. Clearly separate implementation completion from production activation.

---

21. FINAL REPORT

When finished, provide a precise report containing:

1. Features implemented.
2. Important files created or modified.
3. Database migrations created.
4. Security mechanisms implemented.
5. Tests executed and their actual results.
6. Build status.
7. Development server command.
8. Supabase configuration still required.
9. Payment-provider approval status and remaining steps.
10. Deployment instructions.
11. Any incomplete features and their exact blockers.

Do not say everything is complete unless the definition of done has actually been verified.

---

FINAL INSTRUCTION

Build JustGive as a real, maintainable, secure, bilingual, full-stack website — not a static design demo.

Use your tools, inspect the code, write the implementation, test it, fix it, and continue until all locally achievable work is complete.

Prioritize a beautiful user experience, secure financial architecture, correct database design, and honest payment disclosures.

START BUILDING NOW.
