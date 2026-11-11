JUSTGIVE 2.0 — MASTER AUTONOMOUS DEVELOPMENT PROMPT

ROLE

You are the principal full-stack engineer, senior UI/UX designer, motion designer, Supabase architect, payment security engineer, QA engineer and deployment engineer responsible for transforming the existing JustGive project into a premium, production-oriented website.

You must work directly inside the currently open GitHub Codespace repository.

Your task is to inspect, implement, test, optimize and prepare the actual application for deployment.

Do not create a separate demo application.

Do not replace the existing project architecture without a compelling technical reason.

Do not stop after writing a plan or creating a homepage.

Implement the complete phased feature roadmap.

---

1. PROJECT IDENTITY

Product: JustGive

Tagline: Give Freely. Feel Good.

Website purpose:

JustGive is a personal voluntary contribution website.

Visitors may voluntarily contribute money to the website owner for personal purposes and their own satisfaction.

Important business rules:

- It is not a charity.
- It is not an NGO.
- It is not a crowdfunding platform.
- It is not an investment.
- It is not a subscription.
- No financial return, product, reward or service is promised.
- Contributions are entirely voluntary.
- No pressure, guilt, competition or contribution-based ranking.
- Public contributor identity must remain anonymous by default.

Make these disclosures accessible before payment and throughout the website.

---

2. FIRST ACTION: AUDIT THE EXISTING REPOSITORY

Before modifying any files:

1. Inspect the complete repository structure.
2. Read package.json and lockfile.
3. Identify the Next.js version and routing architecture.
4. Inspect existing components and layouts.
5. Inspect existing theme tokens and CSS.
6. Inspect all existing Supabase integrations.
7. Inspect database migrations and RLS policies.
8. Inspect authentication and admin functionality.
9. Inspect the existing payment provider and transaction workflow.
10. Inspect existing animations and responsive layouts.
11. Identify unfinished features, broken functionality and technical debt.

Create or update:

docs/JUSTGIVE_2_IMPLEMENTATION.md

Record:

- Existing architecture.
- Existing features.
- Existing database schema.
- Existing payment flow.
- Planned modifications.
- Completed implementation phases.
- Known external dependencies.

Do not overwrite working functionality.

Reuse existing components and utilities wherever practical.

Never expose environment variable values, API keys, service-role credentials or payment secrets in logs or documentation.

---

3. DESIGN SYSTEM — OCEAN BREEZE GLASS EXPERIENCE

Preserve and improve the existing Ocean Breeze visual identity.

Absolutely no purple or violet theme.

Brand palette:

- Ocean Teal: #087F8C
- Deep Ocean: #173C42
- Coral: #FF8B78
- Soft Mint: #B8F0DF
- Champagne: #FFF5E8
- White Glass: rgba(255,255,255,0.55)

Create centralized design tokens.

Requirements:

- Consistent glassmorphism throughout the website.
- Sophisticated translucent surfaces.
- Layered backgrounds.
- Soft natural shadows.
- Subtle backdrop blur.
- Beautiful gradients.
- Premium typography.
- Consistent spacing and radius system.
- Accessible text contrast.
- Smooth hover and focus states.
- Responsive desktop, tablet and mobile layouts.

Avoid excessive blur and heavy visual effects that reduce performance.

Do not make every element look like an identical glass card.

Use visual hierarchy and different surface treatments.

Respect reduced-motion preferences.

Maintain the existing theme architecture.

---

4. SIGNATURE BRAND IDENTITY

Create a custom reusable SVG JustGive logo.

Logo concept:

- Coral heart.
- Circular Ocean Teal orbit.
- Mint orbit particle.
- Minimal geometric construction.
- Premium wordmark.
- Distinctive visual identity.

Implement the same brand mark consistently in:

- Main header.
- Mobile header.
- Footer.
- Favicon.
- Loading screen.
- Admin dashboard.
- Browser metadata.

The logo should link to the homepage.

Create a beautiful favicon and application icon where supported.

---

5. PHASE 1 — SIGNATURE INTERACTIVE EXPERIENCE

This is the highest design priority.

A. Living Heart

Build a reusable animated heart component.

Requirements:

- Organic heartbeat animation.
- Smooth floating movement.
- Circular orbital rings.
- Clockwise and counterclockwise particle movement.
- Soft coral glow.
- Subtle depth and layered lighting.
- Touch-responsive interaction.
- Mouse-responsive interaction on desktop.
- Beautiful response when a contribution amount is selected.

Use lightweight CSS, SVG and existing animation libraries where possible.

Do not introduce unnecessary large dependencies.

The entire heart, bottom tip, orbit and decorative particles must remain visible.

Investigate and fix all clipping caused by:

- overflow.
- fixed heights.
- SVG viewBox.
- transforms.
- mobile breakpoints.
- parent wrappers.

Never hide the clipping problem by simply shrinking the illustration.

B. Interactive Hero

Build an engaging hero experience.

Include:

- Custom brand identity.
- Emotional headline.
- Clear contribution CTA.
- Animated heart illustration.
- Floating glass information labels.
- Subtle decorative particles.
- Short transparent explanatory copy.

Support both English and Hindi.

C. Mood-Based Experience

Create a beautiful mood selection component.

Options:

- Happy.
- Calm.
- Grateful.
- Inspired.
- Simply feeling generous.

On selection:

- Change the welcome message.
- Animate the heart.
- Display a contextual short message.
- Update the visual accents subtly.

Mood selection must never change payment amount automatically.

Do not persist sensitive personal emotional information.

D. Smart Contribution Selector

Create premium amount selection cards:

₹1, ₹5, ₹10, ₹21, ₹51, ₹101.

Also support custom amounts.

Requirements:

- Instant selection feedback.
- Animated selection state.
- Responsive layout.
- Input validation.
- Clear minimum and maximum rules based on the configured payment provider.
- Clear final amount display.
- No preselected contribution amount.
- No manipulative urgency or suggested pressure.

Create the signature Ripple of Happiness effect when an amount is selected.

E. Personalized Gratitude Experience

After a payment is independently verified:

- Show an animated gratitude screen.
- Generate a unique contribution reference.
- Display a beautiful thank-you card.
- Offer an optional downloadable card.
- Provide an optional share action.
- Show the payment status clearly.

Never show successful-payment confirmation based only on a client redirect.

---

6. PHASE 2 — KINDNESS UNIVERSE

Build a visually distinctive interactive universe.

A. Kindness Universe

Each verified successful contribution creates one anonymous glowing star.

Requirements:

- Stars generated from verified contribution records.
- Interactive constellation.
- Smooth particle movement.
- Zoom and pan.
- Responsive rendering.
- Beautiful empty state.
- Optional anonymous messages.
- No contributor ranking.

Do not expose transaction IDs, emails, names, phone numbers or payment details.

Use aggregated public data.

Avoid exposing exact transaction timestamps if they can reveal personal information.

B. Digital Kindness Tree

Create an interactive tree.

Each verified contribution adds a leaf.

Requirements:

- Organic leaf animation.
- Growing tree visualization.
- Accessible counters.
- Animated transitions.
- Accurate aggregate data.

The tree is symbolic only. Do not imply that money is being donated to environmental causes.

C. Moments of Kindness

Allow visitors to optionally submit anonymous messages.

Include:

- Message input.
- Character limits.
- Moderation status.
- Consent before public display.
- Rate limiting.
- Spam protection.
- Reporting mechanism.

D. Wall of Kindness 2.0

Build a premium card-based message wall.

Features:

- Animated glass cards.
- Randomized visual layouts.
- Pagination or efficient loading.
- Appreciation reactions.
- Responsive layout.
- Moderation queue.
- Report functionality.

Only approved messages may appear publicly.

Prevent duplicate reactions and abuse.

E. Daily Kindness Moment

Create a daily inspirational content component.

Support:

- English and Hindi.
- Admin-managed content.
- Scheduled publishing where supported.
- Beautiful daily card.
- Optional sharing.

F. Gratitude Journal

Provide a private admin-only gratitude journal.

This is not a public financial ledger.

---

7. PHASE 3 — SECURE CONTRIBUTION AND PAYMENT EXPERIENCE

Inspect and preserve the existing payment integration.

Do not silently replace the existing payment provider.

If payment functionality is incomplete, implement a provider-adapter architecture using the existing provider or a suitable supported provider only after inspecting project configuration.

For India, verify the provider's actual availability, onboarding requirements and permitted use for personal voluntary contributions.

Never invent merchant credentials or claim approval.

Checkout architecture

Implement:

1. Server-side order creation.
2. Amount validation on the server.
3. Payment provider checkout.
4. Server-side signature verification.
5. Verified webhook processing.
6. Idempotent transaction updates.
7. Payment failure handling.
8. Duplicate event protection.
9. Refund workflow where supported.
10. Transaction status retrieval.

Never trust client-side payment success parameters.

Never store card numbers, CVV, UPI PINs or sensitive payment credentials.

Never expose service-role keys or payment secrets to the browser.

Anonymous contributor experience

Public identity defaults to anonymous.

Keep the following concepts separate:

- Public display identity.
- Private payment-provider identity.
- Transaction reference.
- Optional message consent.

Never expose private payer information in public tables or API responses.

Contribution history

Build a secure private contribution history mechanism.

Use an authenticated account or a secure, short-lived, server-validated access mechanism.

Do not expose records based only on predictable transaction IDs.

Refunds

Build a transparent refund request workflow.

Show:

- Refund eligibility.
- Request status.
- Processing status.
- Completion status.

Do not promise refunds outside actual provider and applicable policy support.

---

8. PHASE 4 — TRANSPARENCY AND TRUST

Build a dedicated transparency page.

Display actual verified information:

- Total successful contributions.
- Successful transaction count.
- Total refunds.
- Net retained contribution total, where accurately calculated.
- Last updated time.

All statistics must be calculated from authoritative server-side records.

Exclude:

- Pending payments.
- Failed payments.
- Cancelled orders.
- Duplicate webhook events.
- Refunded amounts from retained totals.

Clearly distinguish gross contributions, refunds and net amounts.

Never invent statistics or show demo numbers as real data.

Add clear disclosures explaining that contributions go personally to the website owner.

---

9. PHASE 5 — ADVANCED INTELLIGENCE

A. AI-Assisted Moderation

Build moderation support for anonymous messages.

Requirements:

- Spam detection.
- Abusive content detection.
- Suspicious URL detection.
- Duplicate message detection.
- Human review for uncertain cases.
- Admin approval and rejection.

AI moderation must be optional and fail safely.

Never publish unapproved messages because an AI service is unavailable.

Do not send payment details or sensitive personal data to AI services.

B. Fraud and Abuse Protection

Implement:

- Rate limiting.
- Repeated failed payment monitoring.
- Duplicate event detection.
- Suspicious activity flags.
- Input validation.
- CSRF protection where applicable.
- Secure headers.
- Server-side authorization.
- Audit logging.

Never automatically accuse users of fraud based on a simple heuristic.

C. Accessibility Center

Provide:

- Reduced-motion support.
- Keyboard navigation.
- Accessible form labels.
- Screen-reader announcements.
- Contrast-friendly states.
- Scalable typography.
- Focus indicators.

D. PWA

Where compatible with the existing application, implement:

- Web app manifest.
- Application icons.
- Installability.
- Offline fallback page.
- Appropriate caching strategy.

Do not cache payment or private user data in public service-worker caches.

E. Ambient Experience

Provide optional ambient sound.

Requirements:

- Off by default.
- User-controlled mute.
- No automatic sound playback.
- Lightweight audio.
- Respect user preferences.

F. Advanced Analytics

Admin-only analytics:

- Contribution trends.
- Successful payments.
- Failure rates.
- Refund trends.
- Message moderation statistics.
- Engagement metrics.

Never expose private transaction data publicly.

---

10. ADMIN DASHBOARD

Create or improve a secure owner-only admin dashboard.

Sections:

1. Overview.
2. Transactions.
3. Payment events.
4. Refund management.
5. Wall of Kindness moderation.
6. Daily content management.
7. Kindness Universe settings.
8. Contribution analytics.
9. Website configuration.
10. Security center.
11. Audit logs.

Requirements:

- Server-enforced admin authorization.
- Supabase RLS.
- Secure session handling.
- No hardcoded credentials.
- No client-only admin role checks.
- Confirmation for sensitive operations.
- Audit trail for important changes.
- Responsive glass dashboard.

Admin-only operations must never be exposed to unauthenticated visitors.

---

11. DATABASE AND SUPABASE

Inspect the existing schema before making migrations.

Create additive, reversible migrations where practical.

Implement or adapt these logical modules:

- contributions
- payment_orders
- payment_events
- refunds
- kindness_messages
- message_reactions
- daily_moments
- site_settings
- admin_users
- audit_logs

Use appropriate foreign keys, indexes, constraints, timestamps and status enums.

Requirements:

- Row Level Security.
- Least-privilege policies.
- Server-side service-role operations only.
- Public read access only for explicitly approved content and safe aggregated statistics.
- No public access to payment metadata or payer identity.
- Secure message submission.
- Admin-only moderation.
- Idempotent payment processing.

Never use broad unrestricted RLS policies.

Do not overwrite or drop existing production tables.

Add migration documentation.

---

12. LANGUAGE SUPPORT

Implement consistent bilingual support.

Languages:

- English.
- Hindi.

Requirements:

- All navigation.
- All forms.
- Payment instructions.
- Validation messages.
- Error messages.
- Gratitude cards.
- Legal disclosures.
- Admin labels.
- Empty states.

Language switching must preserve the current page and work on mobile.

Use the existing internationalization system if one exists.

Avoid duplicated hardcoded translations across components.

---

13. UI AND ANIMATION QUALITY

The entire website must feel like one coherent premium experience.

Implement:

- Smooth section transitions.
- Scroll-triggered reveals.
- Micro-interactions.
- Soft hover movement.
- Interactive glass cards.
- Organic heart animation.
- Orbiting particles.
- Ripple transitions.
- Beautiful loading skeletons.
- Elegant toast notifications.
- Polished modal transitions.

Use motion purposefully.

Avoid:

- Excessive animations.
- Unnecessary parallax.
- Flashing elements.
- Layout shifts.
- Heavy 3D libraries unless justified.

Target smooth performance on mid-range Android devices.

Respect prefers-reduced-motion.

---

14. RESPONSIVE DESIGN

Test at:

- 360px.
- 390px.
- 430px.
- 768px.
- 1024px.
- 1280px.
- 1440px.

Mobile is a first-class design target.

Check:

- No horizontal overflow.
- No clipped heart.
- No overlapping header.
- Correct touch targets.
- Proper typography.
- Correct glass panel positioning.
- Working mobile menu.
- Usable checkout.
- Correct modal dimensions.
- Safe-area support.

---

15. SECURITY AND LEGAL DISCLOSURES

This is a personal voluntary-contribution website.

Implement clear disclosures:

- Who receives the money.
- The personal purpose of contributions.
- Contributions are voluntary.
- No product, service, investment or financial return is provided.
- Public anonymity does not necessarily mean anonymity to payment providers.
- Privacy policy.
- Terms of use.
- Refund policy.
- Contact information.

Do not describe personal contributions as charitable donations or tax-deductible donations.

Do not claim regulatory compliance or payment-provider approval without evidence.

Identify legal, tax, KYC and payment onboarding requirements that require the owner's external action.

---

16. TESTING AND QUALITY ASSURANCE

Create and execute tests for:

- Amount validation.
- Custom amount boundaries.
- English/Hindi switching.
- Anonymous public identity.
- Message submission.
- Message moderation.
- Reaction duplication.
- Payment order creation.
- Payment signature verification.
- Webhook idempotency.
- Payment status transitions.
- Refund handling.
- RLS access restrictions.
- Admin authorization.
- Public statistics.
- Accessibility.
- Responsive layouts.

Run:

- ESLint.
- TypeScript checks.
- Unit tests.
- Integration tests.
- Existing end-to-end tests.
- Production build.

Fix actual errors rather than suppressing them.

Do not report tests as passed unless they were executed.

---

17. PERFORMANCE

Optimize:

- Images.
- SVG.
- Fonts.
- JavaScript bundles.
- Animation rendering.
- Database queries.
- Pagination.
- Server rendering.
- Mobile loading.

Use lazy loading for non-critical visualizations.

Avoid unnecessary client components.

Prefer server components where appropriate.

Avoid loading the entire Kindness Universe dataset at once.

Use canvas or another efficient rendering strategy only if justified by the actual scale.

Do not introduce heavy dependencies without measuring their benefit.

---

18. IMPLEMENTATION RULES

Work autonomously.

Follow the phases in order.

After each phase:

1. Inspect changed files.
2. Run relevant checks.
3. Fix errors.
4. Update implementation documentation.
5. Continue to the next phase.

Do not repeatedly ask the owner for permission for routine code decisions.

Use existing project conventions.

If credentials are missing:

- Implement everything possible around the integration.
- Create an accurate environment variable example.
- Document the exact missing external configuration.
- Never fabricate credentials.

If an external approval is required:

- Identify it clearly.
- Do not claim that it has been obtained.

Do not use mock payment success in production.

Do not replace real database functionality with static arrays.

Do not create fake analytics.

Do not leave important buttons non-functional.

Do not silently delete existing functionality.

---

19. FINAL ACCEPTANCE CRITERIA

The project is complete only when:

[ ] Existing application architecture is preserved.
[ ] Premium Ocean Breeze design is consistent.
[ ] No purple/violet theme remains.
[ ] Custom JustGive logo is implemented.
[ ] Animated heart is fully visible.
[ ] Circular orbital animation works.
[ ] Mood selection works.
[ ] Contribution selector works.
[ ] Thank-you experience works.
[ ] Kindness Universe works with verified data.
[ ] Kindness Tree works with verified data.
[ ] Anonymous messages work.
[ ] Moderation works.
[ ] Bilingual interface works.
[ ] Payment flow is securely implemented.
[ ] Payment webhooks are verified and idempotent.
[ ] Contribution history is private.
[ ] Refund workflow is implemented where supported.
[ ] Transparency metrics use authoritative records.
[ ] Admin dashboard is server-secured.
[ ] RLS policies are tested.
[ ] Mobile responsiveness is verified.
[ ] Accessibility is tested.
[ ] Production build succeeds.
[ ] All remaining external dependencies are documented.

---

20. FINAL DELIVERABLES

Produce:

1. Fully implemented website.
2. Updated design system.
3. Reusable component library.
4. Database migrations.
5. Secure Supabase policies.
6. Payment integration.
7. Admin dashboard.
8. English and Hindi translations.
9. Automated tests.
10. Updated environment example.
11. Implementation documentation.
12. Deployment checklist.

At the end, report:

- Features implemented.
- Important files changed.
- Database migrations created.
- Tests actually executed.
- Production build result.
- Security issues found and resolved.
- External credentials still required.
- External approvals still required.
- Exact next steps for deployment.

IMPORTANT:

Do not stop after creating the roadmap.

Do not stop after Phase 1.

Continue implementing all feasible phases until the project reaches the acceptance criteria or an actual external dependency blocks further progress.

The final result must be a polished, functional, responsive, secure and production-oriented JustGive website — not a mockup.

BEGIN BY AUDITING THE EXISTING REPOSITORY, THEN IMPLEMENT THE PROJECT.