# plan.md — InterviewIQ (React + FastAPI + MongoDB + Claude via Emergent)

## 1) Objectives (Updated)
- Deliver a **completed MVP** of InterviewIQ with a **premium dark UI** and production-ready structure.
- Confirm the **core AI interview loop** works end-to-end in the integrated app:
  - generate question → submit answer → strict-ish JSON evaluation (6 dims) → next question → complete report.
- Ship a cohesive, mobile-responsive product with:
  - Landing → Auth → Dashboard → Practice → Report → Progress
  - Company Question Prediction, Resume Analysis, Salary Coach (Premium-gated)
- Ensure **plan gating** is enforced consistently across UI + API.
- Deliver **monetization readiness** via **Stripe Checkout** for Pro/Premium upgrades.
- Deliver a **Voice Interview Mode** (Pro feature) using browser-native speech APIs.
- Track and mitigate low-priority reliability gaps (notably **company-prep timeouts** under constrained AI budgets).

---

## 2) Implementation Steps

### Phase 1 — Core AI POC (Isolation) ✅ COMPLETE
**User stories (validated)**
1. AI asks a realistic first question for company/role/persona.
2. Answers are graded into a consistent JSON schema with 6-dimension scoring.
3. Actionable feedback + STAR rewrite returned immediately.
4. Follow-up question can reference prior context.
5. Session completes and returns a summary (note: summary generation can be limited by external AI budget constraints).

**Delivered**
- Deployed uploaded backend + AI service.
- Added env configuration (`EMERGENT_LLM_KEY`, `JWT_SECRET`) and installed deps.
- Created and ran `tests/test_core_ai.py` POC script.

**Outcome**
- Core AI endpoints validated; one observed failure was budget/time related (non-blocking for MVP).

---

### Phase 2 — V1 App Development (MVP around proven core) ✅ COMPLETE
**User stories (delivered)**
1. Register/login and start a practice interview.
2. Smooth chat interview experience with loading indicators.
3. Per-answer scoring + STAR rewrite in a feedback panel.
4. Complete an interview and see a report with charts.
5. Company prep + resume analysis work end-to-end with clear plan locks.

**Backend (FastAPI + Mongo) — Delivered**
- Integrated uploaded InterviewIQ backend into `/app/backend`.
- Configured `.env` for MongoDB + JWT + Claude key.
- Installed required dependencies (incl. `pdfplumber`, `python-jose`).
- Confirmed core workflows:
  - Auth: `/auth/register`, `/auth/login`, `/auth/me`, `/auth/profile`
  - Interviews: `/interviews/start`, `/answer`, `/next-question`, `/complete`, `/interviews` list, `/interviews/{id}`
  - Company prep: `/company-prep`
  - Resume: `/resume/analyze`, `/resume/history`
  - Dashboard: `/dashboard/stats`, `/dashboard/progress`
  - Plan: `/plan/upgrade` (dev override)
- Enforced plan gating at API level (free limits + premium-only endpoints).

**Frontend (React + Tailwind + shadcn/ui + Framer Motion + Zustand) — Delivered**
- Applied premium dark theme tokens, glass cards, and typography (Syne + Inter + JetBrains Mono).
- Implemented/updated pages and flows:
  - Landing (hero, features, testimonials, pricing preview, CTA, footer)
  - Auth (Login/Register split layouts)
  - Dashboard (KPIs + recent sessions + quick start)
  - Interview Setup (4 personas, 6 rounds, text/voice option with plan gating)
  - Interview Session (chat UI + live feedback rail on desktop)
  - Session Complete (radar chart + dimension breakdown + question review)
  - Company Question Prediction
  - Resume Analysis
  - Salary Coach (Premium-gated)
  - Progress (trend + radar + weakness chart + achievements)
  - Settings (profile + plan upgrade entry)
  - Pricing (Free/Pro/Premium)
- Added skeleton/empty states and toast messaging (Sonner).
- Ensured routing + protected routes via Zustand auth store.

---

### Phase 2.5 — Validation & QA ✅ COMPLETE (97.4% overall pass)
**Testing agent results (Iteration 1)**
- Frontend: **100% pass** (all major user flows validated)
- Backend: **92.9% pass**
- Overall: **97.4% pass (37/38)**

**Only known issue (LOW priority)**
- `/api/company-prep` can **timeout** under constrained AI budgets (observed 30s timeout in testing).
  - Not a functional regression; related to AI latency/budget.

**Artifacts**
- Testing report: `/app/test_reports/iteration_1.json`
- Test credentials stored at: `/app/memory/test_credentials.md`

---

### Phase 3 — Voice Mode + Stripe Monetization ✅ COMPLETE (100% pass)
**User stories (delivered)**
1. As a Pro user, I can run **voice interviews**: speak answers, see live transcription, and submit.
2. As a Pro user, I can hear AI questions via **auto-speak**, and replay them on demand.
3. As a user, I can upgrade to Pro/Premium via **Stripe Checkout** from Pricing/Settings.
4. As a user, after returning from Stripe, my **plan updates automatically** after payment verification.
5. As an operator, I have a **payment_transactions audit trail** in MongoDB.

**Voice Interview Mode (Pro feature) — Delivered**
- Added `useVoice` hook using browser-native **Web Speech API**:
  - SpeechRecognition (STT) + SpeechSynthesis (TTS)
- Updated `InterviewSession`:
  - Voice/Text mode toggle
  - Mic recording button + live transcript panel
  - Auto-speak toggle for interviewer questions + replay button
  - Safe stop/cancel behavior for recording/speaking during submit/end
- Plan gating:
  - Voice option remains **Pro-gated** (Free users blocked in setup).
- Browser support:
  - Best on **Chrome/Edge**; limited elsewhere (graceful fallback messaging).

**Stripe Payment Integration — Delivered**
- Backend endpoints:
  - `POST /api/payments/create-checkout`
  - `GET /api/payments/status/{checkout_session_id}`
  - `POST /api/webhook/stripe`
- Uses `emergentintegrations.payments.stripe.checkout` with `STRIPE_API_KEY=sk_test_emergent`.
- Server-side fixed pricing (never trust frontend for amounts):
  - Pro: **$19/mo** or **$180/yr**
  - Premium: **$49/mo** or **$468/yr**
- MongoDB:
  - `payment_transactions` collection with indexes for `session_id` (unique) and `user_id`.
- Frontend:
  - Pricing page: redirects to Stripe Checkout for Pro/Premium
  - Settings page: “Upgrade with Stripe” + return handling
  - Payment status polling on return (`payment=success&session_id=...`) to verify and update plan

**Testing agent results (Iteration 2)**
- Backend: **100% (16/16)**
- Frontend: **100% (30/30)**
- Overall: **100% (46/46)**

**Artifacts**
- Testing report: `/app/test_reports/iteration_2.json`

---

### Phase 4 — Reliability & Production Hardening (Optional / Next)
**User stories (polish focus)**
1. As a user, I want company prediction to reliably return (or gracefully degrade) even when AI is slow.
2. As a user, I want consistent performance on mobile with no layout breaks.
3. As a user, I want clearer messaging when a feature is locked by plan.
4. As a user, I want stable analytics rendering across empty/partial data.
5. As an operator, I want better observability for AI failures/timeouts.

**Steps (recommended)**
- Company prep reliability:
  - Increase server-side timeout window where safe.
  - Add retry/backoff for AI calls and return partial results when possible.
  - Add UX: “This can take up to ~45s” + cancel/retry.
- Mobile pass:
  - Verify nav drawer, interview chat input, report charts scale, and long text wrapping.
- Plan gating UX:
  - Standardize upgrade prompts for locked features (Salary Coach/Voice/Resume/Progress as needed).
- Observability:
  - Add request IDs and structured logs for AI calls; log parse failures with redaction.
- Stripe production readiness:
  - Replace test key with live key in production.
  - Add webhook signature verification and event-type allowlisting (if not already handled by integration layer).
  - Add idempotency guarantees for webhook replays.

**Exit criteria**
- Company prep responds reliably or fails gracefully with actionable UI.
- Mobile responsiveness verified for all primary pages.
- No console errors in critical flows.
- Payment upgrade path remains stable under webhook retries.

---

## 3) Next Actions (Updated)
1. Optional hardening (Phase 4):
   - Improve `/company-prep` timeout/retry behavior and UX messaging.
   - Run a mobile responsiveness sweep across all pages.
   - Add more observability around AI calls and Stripe webhooks.
2. If shipping to production:
   - Set `STRIPE_API_KEY` to live key and validate live-mode webhooks.
   - Confirm pricing copy matches Stripe products/amounts.
3. Re-run the testing agent after any changes (target **100%** overall, or document acceptable AI-latency exceptions).

---

## 4) Success Criteria (Updated)
- MVP delivered with premium UI and all primary flows working:
  - Landing → Auth → Dashboard → Interview Setup → Interview Session → Session Report
  - Company Prep → Resume Analysis → Progress → Settings → Pricing
- Plan gating works in **both** UI and API.
- Monetization readiness:
  - Stripe checkout sessions create successfully and return checkout URLs.
  - On return from Stripe, payment status is verified and the plan is upgraded.
  - Webhook + audit trail exists in MongoDB.
- Voice mode readiness:
  - Pro users can use voice mode end-to-end (STT + optional TTS) with graceful fallback on unsupported browsers.
- Test status:
  - Phase 3 tests: **100% (46/46)**
  - Known low-priority limitation: company-prep latency can vary due to external AI budgets.
- Reliability:
  - Company prep either completes within configured bounds or fails gracefully with retry.
