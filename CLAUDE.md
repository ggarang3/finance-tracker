# Finance Tracker — Project Context for Claude Code

This file briefs any Claude Code session on where the project stands. Read it fully before acting.

## What this is
A **forward-looking personal cash-flow co-pilot** (NOT a backward-looking tracker). It tells the user what's coming, what's safe to spend now, and does the hard thinking for them. Target user: people who avoid money out of anxiety, not laziness. Every screen must pass the five-second, non-judgmental test.

## Stack & structure
- **Frontend:** React + Vite in `client/`. Entry `client/src/main.jsx` wrapped in `<AuthProvider>`.
- **Backend:** Express in `server/` — `index.js` (setup only), `routes/`, `controllers/`, `middleware/`, `database/db.js`.
- **DB:** MySQL, database `finance_tracker`. Local dev: root user, no password.
- **Port 5001** (NOT 5000 — macOS AirPlay returns 403 on 5000).
- **Secrets:** `.env` at project root (PORT, JWT_SECRET, DB_HOST/USER/PASSWORD/NAME), git-ignored.
- Repo: github.com/ggarang3/finance-tracker (branch `main`).
- **GOTCHA:** MySQL DECIMAL returns as a STRING — always wrap in `Number()` before maths.

## How we work together (non-negotiable methodology)
1. **Plan first, confirm, THEN implement.** Do not write or change code until the user explicitly says go.
2. **Full files, not snippets.** Always state which file you're editing.
3. **Explain changes in 2–4 sentences** — both teach and enhance, not one or the other.
4. **Postman-first sequence:** build endpoint → test in Postman → connect DB → test → connect React → commit.
5. **No autonomous changes.** Review backend methodically, folder by folder. No rushing or skipping.
6. **Global CSS** (`client/src/index.css` design tokens) — NOT component-level CSS files.
7. Keep code dynamic, concise, reusable, and consistent with existing patterns. Act as an intellectual sparring partner: test assumptions, offer counterpoints, prioritise truth over agreement.

## Locked product decisions
- **Base planning period = MONTHLY.** Everything normalises to a true monthly-equivalent.
- **Normalisation rule (critical):** monthly-equivalent = amount × (occurrences per year ÷ 12). Fortnightly = ×2.1667, NOT ×2 (there are 26 fortnights/year). This prevents the "two months a year with a third payment" distortion from silently breaking Safe-to-Spend.
- Each recurring item shows: **native cadence** (e.g. $375/fortnight) as the fact, **true monthly-equivalent** (e.g. $812.50) as the planning number, and a **forward projection** of real due dates for the forward view.
- **Project vs smooth is auto-derived from frequency:** monthly-or-tighter = projected as real dates; quarterly+ = smoothed into a per-period set-aside (True Expenses). No manual flag.
- **Hero metric: Safe-to-Spend** — "after everything coming, you can safely spend $X." Never lead with account balance.
- **Three buckets:** Essential / Lifestyle / Savings. Savings is deliberate (user logs it), not leftover.
- **Primary input: CSV bank statement upload.** Manual entry is the fallback. Bank connectivity (CDR/Open Banking) is a far-future, accreditation-gated milestone.
- **AI (Anthropic API) advises and forecasts only — the human always makes the spending call.** Never autopilot.
- **NO trading/investing features.** Parked as a regulated horizon (Australian AFSL / personal-advice territory). Cash-flow, budgeting, savings goals, habit coaching = safe to build. Financial-product recommendations = the line not to cross.
- **Build on the existing codebase. Do NOT restart.** New vision is additive.

## Existing schema (built & tested)
- **users:** id PK, name, email (unique), password_hash, created_at.
- **categories:** id PK, user_id FK, name, type ENUM('essential','lifestyle','savings'), created_at. 13 seeded for user 1.
- **transactions:** id PK, user_id FK, category_id FK (nullable), description, amount DECIMAL(10,2), transaction_date DATE, created_at.

## Existing endpoints (built, Postman-tested)
- POST /api/auth/register, POST /api/auth/login (bcrypt + JWT, 7d expiry)
- GET/POST /api/transactions, PUT/DELETE /api/transactions/:id
- GET /api/transactions/summary (Essential/Lifestyle/Savings breakdown; route MUST sit above /:id)
- GET /api/categories
- Auth middleware verifies Bearer JWT, attaches req.userId. getTransactions uses LEFT JOIN categories.

## CURRENT STATE — Slice 0 (close this FIRST)
The expense/income toggle + `transaction_date` work needs closing before new tables go on top.
1. **Verify the toggle end-to-end:** `createTransaction` must apply the sign from `type` (expense → negative, income → positive, via Math.abs then sign). Confirm the React form actually sends `type`.
2. **Clean bad test rows:** early entries (e.g. Protein, Sports Bet) that predate the toggle show as +income. Fix or delete.
3. **Commit** the toggle + transaction_date work with a clear message.

## NEXT — Slice 1: `recurring_items` (design locked, build Postman-first)
Table:
- `id` INT PK AUTO_INCREMENT
- `user_id` INT FK → users, NOT NULL
- `type` ENUM('income','expense') NOT NULL
- `name` VARCHAR(100) NOT NULL
- `amount` DECIMAL(10,2) NOT NULL — positive magnitude; `type` carries direction (mirrors transactions)
- `frequency` ENUM('weekly','fortnightly','every_4_weeks','monthly','every_2_months','quarterly','every_4_months','twice_yearly','yearly') NOT NULL
- `next_due_date` DATE NOT NULL
- `category_id` INT FK → categories, NULLABLE, ON DELETE SET NULL
- `is_active` BOOLEAN DEFAULT TRUE
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Endpoints (mirror the transactions controller pattern, all auth-scoped WHERE user_id = ?):
- GET /api/recurring — LEFT JOIN categories, ORDER BY next_due_date ASC
- POST /api/recurring
- PUT /api/recurring/:id
- DELETE /api/recurring/:id

Postman test plan: POST a monthly expense → POST an annual expense (True Expense case) → POST fortnightly income → GET (ordered, joined) → PUT (update amount) → DELETE (and confirm cross-user delete is blocked). Only then touch React.

## Build roadmap (vertical slices — each DB → API → UI → tested)
0. Expense/income toggle (closing) · 1. Recurring items · 2. The Plus engine + Safe-to-Spend · 3. Allocations · 4. Forward view · 5. CSV upload + AI categorisation · 6. Savings goals + forecast · 7. AI co-pilot · 8. Deploy + hardening.
By Slice 4 the app is genuinely useful; everything after amplifies.
