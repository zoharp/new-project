# Cold Call Guide Tool — Phase 1

**Version:** 0.1.0  
**Status:** In Development (Phase 3: Code Generation)  
**Timeline:** 10 business days (2 weeks)  
**Team:** 1 Full-Stack Engineer  
**Repository:** https://github.com/zoharp/cold-call

---

## Project Overview

Interactive web-based cold call script guide for Orcanos sales reps. Helps navigate the 8-step founder cold call script, manage objection handling, and track call outcomes.

**Stack:** React 18 + Vite + Supabase + Tailwind CSS  
**Hosting:** Vercel (frontend) + Supabase (backend)  
**Auth:** Supabase Email/Password  

---

## Current Status — Phase 3: Code Generation + PDF Integration ✅ COMPLETE

### Completed ✅
1. **Design Phase** ✅
   - ✅ Specification created (call_guide_spec.md)
   - ✅ Spec reviewed and approved (spec-review.md)
   - ✅ Implementation plan created (implementation-plan.md)
   - ✅ Plan validated (implementation-plan-review.md)
   - ✅ PDF scripts integrated (QA_Manager_Cold_Call_Scripts_Covaris.pdf)

2. **Infrastructure** ✅
   - ✅ Project scaffolded (Vite + React + Tailwind)
   - ✅ Supabase client configured
   - ✅ Git repository initialized
   - ✅ .env created with Supabase credentials

3. **Core Components** ✅
   - ✅ AuthContext (user state management)
   - ✅ CallContext (call state management)
   - ✅ useAuth hook (login/signup/logout)
   - ✅ useScripts hook (load scripts & handlers)
   - ✅ useCall hook (CRUD operations on calls)
   - ✅ ProtectedRoute component
   - ✅ Header component
   - ✅ LoginForm & SignupForm components
   - ✅ Home page with prospect/company name capture
   - ✅ App.jsx with all routes
   - ✅ Tailwind CSS configuration

4. **Call Screen Components** ✅
   - ✅ CallScreen (main call interface with navigation)
   - ✅ ScriptDisplay (renders script content & delivery tips)
   - ✅ Drawer (sidebar for help tips & resistance handlers)
   - ✅ BranchingScreen (Path A/B selection at Step 4, optional system name)
   - ✅ PostCallCapture (end-of-call form with validation)

5. **Dashboard Components** ✅
   - ✅ Dashboard (main dashboard with metrics)
   - ✅ MetricsCard (displays KPI cards)
   - ✅ CallHistory (table with call records)
   - ✅ CallDetailModal (view/edit/delete call details)

6. **Admin Components** ✅
   - ✅ AdminPage (manage scripts & resistance handlers)
   - ✅ Edit Script Modal (edit step content, tips, timers, Path A/B)
   - ✅ Edit Handler Modal (edit resistance handler responses)
   - ✅ Live database updates

6. **Pages** ✅
   - ✅ LoginPage (auth interface)
   - ✅ Home (start call screen with prospect/company fields)
   - ✅ CallPage (wraps CallScreen)
   - ✅ DashboardPage (wraps Dashboard)
   - ✅ AdminPage (manage all scripts and handlers)

7. **Database** ✅
   - ✅ Schema design (4 tables, 4 indexes)
   - ✅ RLS policies defined
   - ✅ Seed data prepared (7 scripts + 3 handlers from PDF)
   - ✅ Setup SQL ready (database-setup.md)

### Recent Updates (Phase 3.5) ✅
- ✅ **PDF Scripts Integration** — All 7 steps + 3 resistance handlers from QA_Manager_Cold_Call_Scripts_Covaris.pdf
- ✅ **Prospect & Company Capture** — Home page now captures prospect_name and company_name
- ✅ **System Name Optional** — BranchingScreen no longer requires system name entry
- ✅ **Side Context Sidebar** — Previous/Next steps displayed in left sidebar with full script text
- ✅ **Improved Text Wrapping** — Script text now wraps naturally without breaking awkwardly
- ✅ **Step Count: 8 → 7** — Updated all UI to reflect 7-step flow (not 8)

### Ready to Run 🚀
- ✅ .env file created
- ✅ All components generated with PDF content
- ✅ All routes configured
- ✅ Database schema ready
- ✅ Dev server running on port 3001
- ⏳ Pending: Database SQL execution in Supabase (execute Section 2 from database-setup.md)

### Next Steps 📋
1. Execute SQL Section 2 in Supabase (see database-setup.md)
2. Test the complete 7-step flow manually
3. Phase 4: Code review and fixes
4. Phase 5: Automated tests (11+ tests)
5. Phase 6: Styling & polish
6. Phase 7: Testing & QA
7. Phase 8: Deployment to Vercel

---

## Admin Panel Features

The Admin Panel (`/admin`) allows authorized users to edit all call scripts, tips, and resistance handlers in real-time.

### Edit Scripts
- View all 7 call steps
- Edit: title, goal, script text, delivery tip, timers (min/max)
- For Step 4: Edit Path A and Path B content separately
- Changes saved immediately to database
- Live updates reflected in call screen next time script is loaded

### Edit Resistance Handlers
- View all 3 resistance handler templates
- Edit: title and full response text
- Changes saved immediately to database
- Updates available in the Drawer during calls

### How to Access
1. Log in as any authenticated user
2. Click "⚙️ Admin" in header navigation
3. Select "Call Scripts" or "Resistance Handlers" tab
4. Click "Edit" on any item
5. Modal opens with all fields editable
6. Save changes (updates database in real-time)

---

## Key Design Decisions

1. **State Management:** React Context (simple for Phase 1)
2. **Database:** Supabase PostgreSQL with RLS for security
3. **Auth:** Supabase built-in email/password (no SSO for Phase 1)
4. **Styling:** Tailwind CSS (utility-first, no custom CSS)
5. **Routing:** React Router v6 (standard SPA routing)
6. **Call Duration:** Auto-timestamp (call_started_at / call_ended_at)
7. **Error Handling:** Try/catch + user-friendly toast notifications

---

## Critical Implementation Notes

### ⚠️ Pre-Implementation Clarifications (REQUIRED)
Before Phase 3.2 code generation:
1. ✅ Prospect answer capture added to Step 3 UI
2. ✅ Call duration mechanism defined (timestamps)
3. ✅ Recording toggle removed from Phase 1
4. ✅ Post-call capture is mandatory (defined)
5. ✅ Error handling strategy documented

### Database Setup
Copy SQL from `/design/database-setup.md` into Supabase SQL editor and run in order:
- Section 1: CREATE TABLE statements
- Section 2: INSERT seed data
- Section 3: ALTER TABLE RLS policies

### Environment Variables
Create `.env` file (copy from `.env.example`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
```

---

## Documentation Files

### Design & Architecture
- `/design/call_guide_spec.md` — Original specification (Phase 1 features, database schema, API endpoints)
- `/design/spec-review.md` — Spec review findings (critical issues resolved, recommendations)
- `/design/implementation-plan.md` — Implementation strategy (12 phases, 10-day timeline)
- `/design/implementation-plan-review.md` — Plan validation (safety checks, rollback strategies)
- `/design/database-setup.md` — **Executable SQL** (copy-paste into Supabase)
- `/design/code-review.md` — Code review findings (populated during Phase 4)

### Project Documentation
- `CLAUDE.md` — This file (project overview)
- `SCHEMA.md` — Database schema documentation
- `ARCHITECTURE.md` — System architecture & component overview
- `SECURITY.md` — Security guidelines & RLS policies
- `DEPLOYMENT.md` — Deployment procedures
- `TESTING.md` — Testing guide (unit, integration, E2E)

---

## Project Structure

```
cold-call/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx ✅
│   │   │   └── SignupForm.jsx ✅
│   │   ├── Call/ (IN PROGRESS)
│   │   │   ├── CallScreen.jsx
│   │   │   ├── ScriptDisplay.jsx
│   │   │   ├── PauseMarker.jsx
│   │   │   ├── Drawer.jsx
│   │   │   ├── BranchingScreen.jsx
│   │   │   └── PostCallCapture.jsx
│   │   ├── Dashboard/ (NOT STARTED)
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MetricsCard.jsx
│   │   │   ├── CallHistory.jsx
│   │   │   └── CallDetailModal.jsx
│   │   └── Layout/
│   │       ├── Header.jsx ✅
│   │       └── ProtectedRoute.jsx ✅
│   ├── context/
│   │   ├── AuthContext.jsx ✅
│   │   └── CallContext.jsx ✅
│   ├── hooks/
│   │   ├── useAuth.js ✅
│   │   ├── useCall.js ✅
│   │   └── useScripts.js ✅
│   ├── lib/
│   │   └── supabase.js ✅
│   ├── pages/
│   │   ├── LoginPage.jsx ✅
│   │   ├── Home.jsx ✅
│   │   ├── CallPage.jsx (NOT STARTED)
│   │   └── DashboardPage.jsx (NOT STARTED)
│   ├── App.jsx ✅
│   ├── main.jsx ✅
│   └── index.css ✅
├── tests/
│   └── suite.test.js (placeholder)
├── design/
│   ├── call_guide_spec.md ✅
│   ├── spec-review.md ✅
│   ├── implementation-plan.md ✅
│   ├── implementation-plan-review.md ✅
│   ├── database-setup.md ✅
│   └── code-review.md (NOT STARTED)
├── .env.example ✅
├── .env (NOT CREATED — create before running)
├── index.html ✅
├── package.json ✅
├── vite.config.js ✅
├── tailwind.config.js ✅
├── postcss.config.js ✅
├── CLAUDE.md (this file) ✅
├── SCHEMA.md (NOT UPDATED)
├── ARCHITECTURE.md (NOT UPDATED)
├── SECURITY.md (NOT UPDATED)
├── DEPLOYMENT.md (NOT UPDATED)
├── TESTING.md (NOT UPDATED)
├── release_notes.json (NOT UPDATED)
├── run_dev.bat (NOT CREATED)
├── run_test.bat (NOT CREATED)
└── run_deploy.bat (NOT CREATED)
```

---

## Quick Start (When Ready)

### 1. Setup Supabase
```bash
# Copy SQL from /design/database-setup.md
# Paste into Supabase SQL editor (3 sections in order)
# Get VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from project settings
```

### 2. Create .env File
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Run Tests
```bash
npm test
```

### 6. Build for Production
```bash
npm run build
```

---

## Phase Checklist

- [x] Phase 1: Spec Clarifications (1-2 hrs) — COMPLETE
- [x] Phase 2: Foundation & Infrastructure (1 day) — COMPLETE
- [x] Phase 3: Database Setup (0.5 day) — COMPLETE (SQL ready, not executed yet)
- [x] Phase 3.1: Core Components (1.5 days) — **IN PROGRESS**
- [ ] Phase 3.2: Call Screen (2 days)
- [ ] Phase 3.3: Dashboard (2 days)
- [ ] Phase 3.4: Post-Call Capture (1 day)
- [ ] Phase 4: Code Review & Fixes (1 day)
- [ ] Phase 5: Testing (1.5 days)
- [ ] Phase 6: Styling & Polish (1 day)
- [ ] Phase 7: Vercel Deployment (0.5 day)

**Estimated Completion:** 10 business days

---

## Skills Used

- `/spec-review` — Analyzed specification for risks
- `/implementation-plan-review` — Validated implementation plan
- `/new-project` — Scaffolded project structure

---

## Next Actions

1. **Execute database-setup.md SQL** in Supabase SQL editor (when ready to test)
2. **Create .env file** with Supabase credentials
3. **Continue code generation** (Phase 3.2: Call Screen components)
4. **Review generated code** (Phase 4)
5. **Write automated tests** (Phase 5)

---

## Important Notes

### RLS Security
All `calls` queries are automatically scoped to `auth.uid()`. Users cannot access other users' calls due to RLS policies.

### Recording Feature
Recording toggle is **removed from Phase 1 UI** (see spec review). All recording features deferred to Phase 2.

### Prospect Answer Capture
Step 3 captures prospect's answer in a textarea before advancing. This enables Step 4 branching (Path A/B).

### Call Duration
`call_started_at` is set when "Start Call" is clicked.  
`call_ended_at` is set when user submits post-call capture form.  
Duration calculated in seconds: `EXTRACT(EPOCH FROM (call_ended_at - call_started_at))`

### Error Handling
All Supabase queries wrapped in try/catch. Errors shown as toast notifications. No silent failures.

---

## Version History

### v0.1.0 (In Development)
- Phase 1: Design & Planning
- Phase 2-3: Foundation & Core Components
- Phase 4-7: Code, Tests, Styling, Deployment

---

**Last Updated:** 2026-06-09  
**Project Lead:** Claude AI  
**Repository:** https://github.com/zoharp/cold-call
