# plan.md — InterviewIQ (React + FastAPI + MongoDB + Claude via Emergent)

## 1) Objectives
- Prove the **core AI interview loop** works reliably with real Claude calls: **generate question → submit answer → strict JSON evaluation (6 dims) → next question → complete report**.
- Deploy the uploaded codebase into `/app`, ensure **env + dependencies** are correct, and harden error handling.
- Upgrade UI/UX to match PRD’s **dark premium** design and tighten product flows (mobile-first, empty/loading/error states).
- Enforce **plan gating** (Free/Pro/Premium) consistently across UI + API for all gated features.

---

## 2) Implementation Steps

### Phase 1 — Core AI POC (Isolation) ✅ required
**User stories**
1. As a user, I want the AI to ask a realistic first question for my company/role/persona.
2. As a user, I want my answer graded in a consistent JSON schema every time.
3. As a user, I want actionable feedback + a rewritten STAR answer immediately.
4. As a user, I want a second question that references prior context.
5. As a user, I want the session to complete and return a summary without crashing.

**Steps**
- Add `EMERGENT_LLM_KEY` (provided) + set/verify backend `.env` for Mongo + JWT.
- Create a small Python script (or pytest) that calls:
  - `generate_question()`
  - `evaluate_answer()`
  - `generate_session_summary()`
  Validate JSON parsing, score ranges, and retry/fallback behavior.
- Add minimal schema validation (Pydantic model or runtime checks) around evaluator output; log raw response on parse fail.
- Quick best-practice research: “Claude structured JSON reliability”, retry patterns, temperature/token settings.
- Exit criteria: repeatable success across 5–10 runs; no uncaught exceptions.

---

### Phase 2 — V1 App Development (MVP around proven core)
**User stories**
1. As a user, I want to register/login and immediately start a practice interview.
2. As a user, I want a smooth chat interview experience with clear turns and loading indicators.
3. As a user, I want per-answer scoring + STAR rewrite shown in a feedback panel/drawer.
4. As a user, I want to complete an interview and see a session report with charts.
5. As a user, I want company prep + resume analysis pages to work end-to-end with clear plan locks.

**Backend (FastAPI + Mongo)**
- Replace the current `/app` starter API with uploaded InterviewIQ backend (routes + models + ai_service).
- Ensure required deps are installed (notably `pdfplumber`) and runtime boots cleanly.
- Harden endpoints:
  - Consistent error envelopes for AI failures and validation errors.
  - Timeouts + retries where appropriate in `ai_service`.
  - Ensure session ownership checks everywhere.
- Confirm key workflows:
  - `/auth/register`, `/auth/login`, `/auth/me`, `/auth/profile`
  - `/interviews/start`, `/answer`, `/next-question`, `/complete`, `/interviews` list
  - `/company-prep`, `/resume/analyze`, `/dashboard/stats`, `/dashboard/progress`
- Enforce plan gating in API (already present for interview limits/voice/resume/salary) and align with PRD limits.

**Frontend (React + Tailwind + shadcn/ui + Framer Motion + Zustand)**
- Replace `/app/frontend` scaffold with uploaded InterviewIQ frontend.
- Ensure `REACT_APP_BACKEND_URL` wiring works locally/preview.
- UI polish toward PRD:
  - Apply consistent dark theme tokens, typography, spacing, and card styles.
  - Add missing states: skeletons for fetches, empty states for lists, actionable error toasts.
  - Improve interview chat: streaming-like typing indicator, disabled input while evaluating, clear progress.
- Implement plan lock UX:
  - Locked feature CTAs show upgrade modal; API errors map to friendly messages.
- End Phase 2 with 1 full E2E run: Register → Start interview → answer 2–3 Qs → complete → view report; plus Company Prep + Resume upload.

---

### Phase 3 — Feature Expansion + Hardening (production-leaning)
**User stories**
1. As a Pro user, I want unlimited interviews with consistent performance and stable analytics.
2. As a Premium user, I want Salary Coach to feel realistic and persist negotiation history.
3. As a user, I want Progress charts to accurately reflect my sessions and weaknesses.
4. As a user, I want achievements/milestones to update predictably as I practice.
5. As a user, I want faster perceived UX via caching and pagination.

**Steps**
- Tighten analytics correctness:
  - Ensure dimension averages + weakness frequency are computed consistently.
  - Improve session report UI (radar + per-question review) and export-ready layout.
- Add/finish premium features already stubbed:
  - Panel interview simulation (if present in frontend) or hide behind Premium with clear messaging.
  - Salary coach report/debrief view.
- Data/perf hardening:
  - Add indexes for common queries; pagination for sessions/answers.
  - Add simple rate limiting on expensive AI endpoints.
  - Centralized logging with request IDs for AI errors.
- End Phase 3 with 1 E2E run across: Progress → Salary coach (Premium) → Company prep cached → Resume history.

---

### Phase 4 — Monetization readiness (optional, next)
**User stories**
1. As a user, I want upgrading my plan to immediately unlock gated features.
2. As a user, I want plan status to persist across devices.
3. As a user, I want billing changes to not break my interview history.
4. As an admin, I want clear config errors if billing isn’t set up.
5. As a user, I want pricing to match exactly what’s enforced in-product.

**Steps**
- Keep current mocked `/plan/upgrade` for dev; optionally integrate Stripe later.
- Align plan copy, limits, and UI gating with backend enforcement.

---

## 3) Next Actions
1. Move uploaded backend/frontend into `/app` and keep envs intact.
2. Set backend `.env` with `EMERGENT_LLM_KEY=sk-emergent-8E0690a02Bb2dE5AbB` and a non-default `JWT_SECRET`.
3. Install missing backend deps (e.g., `pdfplumber`) and run the server.
4. Run Phase 1 POC script repeatedly; fix JSON parse issues/retries until stable.
5. Boot frontend against local backend; run one full happy-path flow end-to-end.

---

## 4) Success Criteria
- Core loop is stable: question generation + evaluation JSON parse success ≥95% (with retries) and no uncaught exceptions.
- All primary pages load with correct empty/loading/error states; no blank screens.
- Plan gating works in **both** UI and API (Free limits enforced; Premium-only salary coach enforced).
- E2E flows pass:
  - Auth → interview → scoring → completion report
  - Company prep generation + caching
  - Resume upload (PDF) → analysis → history
  - Progress dashboard renders charts from real data
