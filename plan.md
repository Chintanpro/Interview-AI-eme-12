# plan.md — InterviewIQ (React + FastAPI + MongoDB + Claude via Emergent)

## 1) Objectives (Updated)
- Deliver a **completed MVP** of InterviewIQ with a **premium dark UI** and production-ready structure.
- Confirm the **core AI interview loop** works end-to-end in the integrated app:
  - generate question → submit answer → strict-ish JSON evaluation (6 dims) → next question → complete report.
- Ship a cohesive, mobile-responsive product with:
  - Landing → Auth → Dashboard → Practice → Report → Progress
  - Company Question Prediction, Resume Analysis, Salary Coach (Premium-gated)
- Ensure **plan gating** is enforced consistently across UI + API.
- Close remaining low-priority reliability gaps (notably **company-prep timeout** under constrained AI budgets).

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
  - Plan: `/plan/upgrade`
- Enforced plan gating at API level (free limits + premium-only endpoints).

**Frontend (React + Tailwind + shadcn/ui + Framer Motion + Zustand) — Delivered**
- Applied premium dark theme tokens, glass cards, and typography (Syne + Inter + JetBrains Mono).
- Implemented/updated pages and flows:
  - Landing (hero, features, testimonials, pricing preview, CTA, footer)
  - Auth (Login/Register split layouts)
  - Dashboard (KPIs + recent sessions + quick start)
  - Interview Setup (4 personas, 6 rounds, text/voice gating)
  - Interview Session (chat UI + live feedback rail on desktop)
  - Session Complete (radar chart + dimension breakdown + question review)
  - Company Question Prediction
  - Resume Analysis
  - Salary Coach (Premium-gated)
  - Progress (trend + radar + weakness chart + achievements)
  - Settings (profile + plan upgrade)
  - Pricing (Free/Pro/Premium)
- Added skeleton/empty states and toast messaging (Sonner).
- Ensured routing + protected routes via Zustand auth store.

---

### Phase 2.5 — Validation & QA ✅ COMPLETE (97.4% overall pass)
**Testing agent results**
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

### Phase 3 — MVP Delivery Polish + Reliability Hardening (Next)
**User stories (polish focus)**
1. As a user, I want company prediction to reliably return (or gracefully degrade) even when AI is slow.
2. As a user, I want consistent performance on mobile with no layout breaks.
3. As a user, I want clearer messaging when a feature is locked by plan.
4. As a user, I want stable analytics rendering across empty/partial data.
5. As an operator, I want better observability for AI failures/timeouts.

**Steps (revised, MVP-closeout oriented)**
- Company prep reliability (LOW priority but recommended):
  - Increase server-side timeout window for the company-prep call where safe.
  - Add retry/backoff for AI calls and return partial results when possible.
  - Add UX: “This can take up to ~45s” + cancel/retry.
- Mobile pass:
  - Verify nav drawer, interview chat input, report charts scale, and long text wrapping.
- Plan gating UX:
  - Standardize upgrade prompts for locked features (Salary Coach/Voice/Resume if gated).
- Observability:
  - Add request IDs and structured logs for AI calls; log parse failures with redaction.

**Exit criteria**
- Company prep responds reliably or fails gracefully with actionable UI.
- Mobile responsiveness verified for all primary pages.
- No console errors in critical flows.

---

### Phase 4 — Monetization readiness (optional, next)
**User stories**
1. Upgrading a plan immediately unlocks gated features.
2. Plan persists across devices.
3. Billing changes do not break history.
4. Clear config errors if billing isn’t set up.
5. Pricing copy matches what is enforced.

**Steps**
- Keep mocked `/plan/upgrade` for dev; optionally integrate Stripe later.
- Align plan limits/copy with PRD and confirm enforcement.

---

## 3) Next Actions (Updated)
1. Perform Phase 3 polish:
   - Improve `/company-prep` timeout/retry behavior and UX messaging.
   - Run a mobile responsiveness sweep across all pages.
2. Re-run the testing agent after any changes (target **100%** overall, or document acceptable AI-latency exceptions).
3. Prepare delivery notes:
   - Test user credentials
   - Feature list and gating behavior
   - Known limitations (AI budget/latency)

---

## 4) Success Criteria (Updated)
- MVP is delivered with premium UI and all primary flows working:
  - Landing → Auth → Dashboard → Interview Setup → Interview Session → Session Report
  - Company Prep → Resume Analysis → Progress → Settings → Pricing
- Plan gating works in **both** UI and API.
- Test status:
  - Frontend flows pass end-to-end.
  - Backend endpoints pass with documented AI-latency exception for company-prep.
- Reliability:
  - Company prep either completes within configured bounds or fails gracefully with retry.
