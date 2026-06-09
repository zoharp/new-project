# Specification Review

Generated: 2026-06-09T21:42:35.356Z
Reviewer: Claude AI

## Design Specification

```markdown
# Cold Call Guide Tool — Phase 1 Specification

## Overview

Interactive web-based cold call script guide for Orcanos sales. Helps sales reps navigate the 8-step founder cold call script, manage objection handling, and track call outcomes. Desktop browser-based.

**Stack:** React (Vercel) + Supabase + Tailwind CSS  
**Auth:** Supabase Auth (email/password)  
**Database:** Supabase PostgreSQL  
**Phase 1 Timeline:** 1–2 weeks

---

## Feature List (Phase 1)

### Core
- [ ] Pre-call minimal setup (just "Start Call" button)
- [ ] Active call screen: script delivery + pause markers + controls
- [ ] Step 4 branching (Path A / Path B selection)
- [ ] Resistance handler sidebar (always available, 3 handlers)
- [ ] SOS/Help button (contextual quick tips)
- [ ] Back/Next navigation
- [ ] Post-call data capture (prospect name, company, system, path, objections, outcome)
- [ ] Call history dashboard with metrics (calls today, booked, conversion %, avg call length)
- [ ] Recording toggle (optional, no actual recording in Phase 1 — just UI)

### Phase 2 (deferred)
- Live speech recognition (browser-based transcription)
- Auto-detect prospect answers (AI parsing)
- Call recording/playback
- Team management (track reps, compare metrics)
- Coaching insights (pacing, word frequency)

---

## Database Schema (Supabase PostgreSQL)

### Table: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
(Supabase Auth handles password; this table references auth.users)

### Table: `calls`
```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Pre-call & captured
  prospect_name TEXT,
  company_name TEXT,
  call_date TIMESTAMP DEFAULT NOW(),
  call_duration_seconds INTEGER,
  
  -- During call
  path_taken TEXT CHECK (path_taken IN ('A', 'B')), -- A = system named, B = manual/paper
  system_named TEXT, -- e.g., "TrackWise", "Arena", or NULL if Path B
  
  -- Objections encountered
  objections_handled TEXT[], -- e.g., ["too_busy", "no_budget"]
  
  -- Outcome
  outcome TEXT CHECK (outcome IN ('booked', 'follow_up', 'not_interested', 'pending')),
  outcome_notes TEXT, -- free-form notes from rep
  
  -- Metadata
  recording_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_calls_user_date ON calls(user_id, call_date DESC);
```

### Table: `call_scripts`
(Read-only, pre-populated seed data)
```sql
CREATE TABLE call_scripts (
  id SERIAL PRIMARY KEY,
  step_number INTEGER NOT NULL,
  step_title TEXT NOT NULL,
  goal TEXT NOT NULL,
  script_text TEXT NOT NULL,
  timer_seconds_min INTEGER,
  timer_seconds_max INTEGER,
  delivery_tip TEXT,
  path_a_content TEXT, -- For Step 4
  path_b_content TEXT, -- For Step 4
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `resistance_handlers`
(Pre-populated seed data)
```sql
CREATE TABLE resistance_handlers (
  id SERIAL PRIMARY KEY,
  handler_key TEXT UNIQUE NOT NULL, -- e.g., "too_busy", "already_invested", "no_budget"
  title TEXT NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Tech Architecture

### Frontend (React)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **State:** React Context or Zustand (minimal)
- **Auth:** Supabase Auth SDK
- **Database:** Supabase JS SDK (@supabase/supabase-js)
- **Hosting:** Vercel

### Backend
- **None in Phase 1** — Supabase handles all queries via REST API + RLS (Row Level Security)
- React calls Supabase directly

### Deployment
- **Frontend:** `vercel deploy` → Vercel
- **Database:** Supabase project (auto-managed)
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (safe to expose)

---

## Screen Specifications

### Screen 1: Pre-Call Setup
**Path:** `/` (home) or after login

**Elements:**
- Simple card with "Ready to call?" headline
- "Start Call" button
- No forms, no friction

**Action:** Redirects to `/call` with a new call record created (outcome = "pending")

---

### Screen 2: Active Call
**Path:** `/call/:callId`

**Layout:**
- **Header:** Step number (e.g., "Step 3 of 8"), step title, timer (e.g., "20–40 seconds")
- **Main:** 
  - Goal (colored box, left-border accent)
  - Script text (large, readable, 18px+)
  - Pause marker (animated, info color, prominent)
  - Delivery tip (italic, secondary)
- **Footer:**
  - Back / Next Step buttons (primary button is Next)
  - Icon buttons: ? (SOS), 📋 (Transcript), 🛡️ (Objections)
  - Recording badge (REC with pulsing dot)
- **Sidebar (drawer, hidden by default):**
  - Slides in from right when icon clicked
  - Contains: Transcript tab, Resistance handlers, or SOS tips
  - Close button (X)

**Step content sourced from:** `call_scripts` table (pre-loaded at app start)

**Interactions:**
- Back: Go to previous step (or disable if step 1)
- Next Step: Advance to next step
- At Step 4: Show two buttons instead of one Next ("Path A →" / "Path B →")
- Icon buttons: Toggle drawer with relevant content
- Recording toggle: Just UI toggle, stores in `calls.recording_enabled`

**Data to capture live (optional):**
- User can add notes in a textarea (post-call)
- Objections checkboxes (too_busy, already_invested, no_budget) — user checks if they came up

---

### Screen 3: Step 4 Branching (Special Screen)
**Path:** `/call/:callId/branch`

**Elements:**
- "They said: [prospectAnswer]" (displayed from user input, e.g., "TrackWise")
- Two large buttons:
  - **Path A:** "They named a system"
  - **Path B:** "Paper / Excel / Manual"
- Once selected → redirect to Step 4 script (Path A or B variant loaded from `call_scripts`)

**Logic:**
- At Step 3, after "Next Step", if prospect answers, show this screen
- User confirms which path → script content dynamically loads
- Store `calls.path_taken` in DB

---

### Screen 4: Post-Call Capture
**Path:** `/call/:callId/capture` (or inline modal on "End Call")

**Elements:**
- Prospect name (text input, pre-filled if available)
- Company (text input)
- System they use (text input, only if Path A)
- Objections encountered (checkboxes: too_busy, already_invested, no_budget, other)
- Outcome (dropdown: booked, follow_up, not_interested)
- Notes (textarea)
- Save button

**Action:** Saves to `calls` table, redirects to dashboard

---

### Screen 5: Dashboard
**Path:** `/dashboard`

**Metrics (top):**
- Calls today (count)
- Booked (count)
- Conversion rate (%) = booked / calls today
- Avg call length (mm:ss)

**Call history (table below):**
- Columns: Prospect / Company, Outcome (badge color), Time
- Sorted: Most recent first
- Click row → view call details (modal or detail page)

**Call details modal:**
- All captured fields
- Option to edit outcome/notes
- Delete option

---

## API / Supabase Queries (React Code)

### Auth
```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Call Management
```javascript
// Create new call
const { data, error } = await supabase
  .from('calls')
  .insert({
    user_id: currentUser.id,
    outcome: 'pending',
  })
  .select()
  .single();
// Returns: callId

// Get call by ID
const { data, error } = await supabase
  .from('calls')
  .select('*')
  .eq('id', callId)
  .single();

// Update call (during/after)
const { error } = await supabase
  .from('calls')
  .update({
    prospect_name: 'David Chen',
    company_name: 'Medtronic',
    path_taken: 'A',
    system_named: 'TrackWise',
    objections_handled: ['too_busy'],
    outcome: 'booked',
    outcome_notes: 'Scheduled for 2:00 PM Thursday',
    call_duration_seconds: 480,
  })
  .eq('id', callId);

// List calls for dashboard
const { data, error } = await supabase
  .from('calls')
  .select('*')
  .eq('user_id', currentUser.id)
  .order('call_date', { ascending: false })
  .limit(50);

// Today's calls (for metrics)
const today = new Date().toISOString().split('T')[0];
const { data, error } = await supabase
  .from('calls')
  .select('*')
  .eq('user_id', currentUser.id)
  .gte('call_date', `${today}T00:00:00`)
  .lte('call_date', `${today}T23:59:59`);
```

### Script Loading
```javascript
// Load all scripts (once at app init)
const { data: scripts, error } = await supabase
  .from('call_scripts')
  .select('*')
  .order('step_number', { ascending: true });

// Load resistance handlers
const { data: handlers, error } = await supabase
  .from('resistance_handlers')
  .select('*');
```

---

## Row Level Security (RLS)

Enable RLS on `calls` table:

```sql
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read/write their own calls"
  ON calls
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

`call_scripts` and `resistance_handlers`: Public read-only (no RLS needed, or:)
```sql
ALTER TABLE call_scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read scripts"
  ON call_scripts
  FOR SELECT
  USING (TRUE);
```

---

## Component Structure (React)

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   └── SignupForm.jsx
│   ├── Call/
│   │   ├── CallScreen.jsx (main call interface)
│   │   ├── ScriptDisplay.jsx
│   │   ├── PauseMarker.jsx
│   │   ├── BranchingScreen.jsx
│   │   ├── PostCallCapture.jsx
│   │   └── Drawer.jsx (sidebar for transcript/handlers/help)
│   ├── Dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── MetricsCard.jsx
│   │   ├── CallHistory.jsx
│   │   └── CallDetailModal.jsx
│   └── Layout/
│       ├── Header.jsx
│       └── ProtectedRoute.jsx
├── context/
│   ├── AuthContext.jsx
│   └── CallContext.jsx (manage current call state)
├── hooks/
│   ├── useCall.js (fetch/update call)
│   ├── useScripts.js (load scripts)
│   └── useAuth.js (auth state)
├── lib/
│   └── supabase.js (Supabase client init)
├── pages/
│   ├── Home.jsx
│   ├── CallPage.jsx
│   ├── DashboardPage.jsx
│   └── LoginPage.jsx
├── App.jsx
└── main.jsx
```

---

## Implementation Order

1. **Auth + Layout** — Supabase Auth, ProtectedRoute, Header
2. **Database init** — Create tables, seed scripts & handlers
3. **Dashboard** — Metrics + call history (data-heavy, stable)
4. **Call Screen** — ScriptDisplay, PauseMarker, Drawer, Navigation
5. **Step 4 Branching** — Path selection logic
6. **Post-Call Capture** — Form + save to DB
7. **Styling & Polish** — Tailwind, responsiveness, accessibility
8. **Deploy** — Vercel + Supabase environment

---

## Styling Notes

- **Design system:** Tailwind CSS
- **Colors:** Follow mockup (info blue for CTAs, secondary for muted text)
- **Typography:** Large script text (18px+), readable line-height (1.6–1.8)
- **Spacing:** Generous whitespace, 2rem gutters
- **Components:** Use Tailwind utilities; no custom CSS unless necessary
- **Responsive:** Mobile-first, test at 768px breakpoint

---

## Seed Data (SQL)

### Scripts (call_scripts table)
Pre-populate with the 8 steps from the Orcanos script:

```sql
INSERT INTO call_scripts (step_number, step_title, goal, script_text, timer_seconds_min, timer_seconds_max, delivery_tip, path_a_content, path_b_content) VALUES
(1, 'The Authority Intro', 'Establish your identity cleanly...', 'Hi [Name], this is [Your Name]. I''m the founder of Orcanos...', 0, 10, 'Speak slowly and naturally. Avoid overly enthusiastic sales greetings.', NULL, NULL),
(2, 'The Core Value Proposition & Orientation', 'Give the prospect immediate context...', 'Thank you. I''m personally leading our enterprise expansion here in the US...', 10, 20, 'Be clear and direct. One sentence definition.', NULL, NULL),
(3, 'The Diagnostic Leading Question', 'Turn the pitch into peer-to-peer consultation...', 'Quick question for you: What are you currently running for your eQMS setup?', 20, 40, 'Speak naturally. This is a genuine question, not a pitch.', NULL, NULL),
(4, 'The Macro-Pain Frame', 'Validate their system choice and highlight isolation trap...', '[Path A/B content loaded dynamically]', 40, 120, 'Drop your pitch energy. Ask casually.', '[PATH A CONTENT]', '[PATH B CONTENT]'),
-- ... (Steps 5–8)
```

### Resistance Handlers (resistance_handlers table)
```sql
INSERT INTO resistance_handlers (handler_key, title, response_text) VALUES
('too_busy', 'Too busy / Middle of a project', 'I completely respect that. If a QA leader told me they weren''t buried in a project, I''d be shocked...'),
('already_invested', 'Already spent money on current system', 'I expect nothing less; you have to have a system in place. But what I usually find is...'),
('no_budget', 'Don''t have the budget right now', 'I completely understand—every corporate dollar is being scrutinized. But as a founder, let me give you the operational math...');
```

---

## Next Steps (Phase 2)

- Speech recognition (Web Speech API or Deepgram)
- Call recording
- Auto-detect objections from transcript
- Team dashboard (track all reps)
- Email notifications (booking confirmation)
- Coaching metrics (pacing, word count, script adherence)

---

## Deployment Checklist

- [ ] Supabase project created + tables/RLS configured
- [ ] Seed data loaded (scripts, handlers)
- [ ] React app scaffolded (Vite)
- [ ] Auth flow working (login/signup)
- [ ] Env vars set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] All screens built + tested
- [ ] Responsive design checked
- [ ] Vercel project linked + auto-deploy from Git
- [ ] Live URL tested end-to-end

---

## Notes for Builder

- Keep Phase 1 focused: no AI, no ML, no complex features
- All script content is read-only (seeded at DB init)
- User flow: Login → Home → Start Call → Navigate Steps → Capture → Dashboard
- Capture screen can be a modal (simpler) or separate page (clearer)
- SOS button: Just a collapsible section with step-specific tips (pre-written, not AI-generated)
- Recording toggle: No actual audio capture in Phase 1 — just boolean flag in DB
- Metrics calculation: Done client-side (group by date, count outcomes)

Refer to mockup screenshots for layout details. Ask for clarification on any ambiguous requirements.

```

## Final Verdict
**READY WITH CHANGES**

This is a well-structured Phase 1 spec with clear requirements and realistic scope. However, several critical data flow inconsistencies and missing error-handling specifications must be resolved before implementation begins.

---

## Summary

The Cold Call Guide is a focused sales enablement tool designed to guide Orcanos reps through an 8-step cold call script with real-time objection handling. The tech stack (React + Supabase + Tailwind) is appropriate and the Phase 1 scope is realistic for a 1–2 week sprint.

**Key Strengths:**
- Clear database schema with proper constraints
- Appropriate use of RLS for multi-user safety
- Realistic feature scope for Phase 1
- Pre-seeded read-only reference data (scripts, handlers)

**Key Risks:**
- Step 4 branching logic relies on undefined "prospect answer" field
- No error recovery strategy defined
- Timer implementation unspecified
- Critical data-capture timing ambiguities

---

## Critical Findings

### 1. Step 4 Branching — Undefined Prospect Answer Data Flow
**Severity: CRITICAL**

**Issue:**
Screen 3 shows "They said: [prospectAnswer]" but the Step 3 UI (Screen 2) provides NO input field to capture this answer. The spec states "if prospect answers, show this screen" but doesn't define how the prospect's answer is captured.

**Impact:**
Developers cannot implement branching without guessing whether: (a) rep manually enters prospect's answer, (b) system auto-detects from speech, or (c) answer is assumed/hardcoded.

**Recommendation:**
Add prospect answer capture to Step 3 UI:
```
After script_text, add textarea: "What system did they mention? (required)"
Flow: Step 3 answer captured → Next → BranchingScreen with answer displayed
```

**Affected:** Screen 2 (Step 3 UI), Screen 3 (branching logic), implementation plan

---

### 2. Call Duration Capture Mechanism Undefined
**Severity: CRITICAL**

**Issue:**
`calls` table expects `call_duration_seconds` but provides no mechanism to capture it. No start/end timestamps. Timer is defined in `call_scripts` (min/max seconds) but this is just a display range, not a capture mechanism.

**Impact:**
Dashboard metric "Avg call length" will always be NULL. Metrics are a core Phase 1 feature.

**Recommendation:**
Add auto-timestamp approach (simplest):
```sql
-- Add to calls table:
call_started_at TIMESTAMP DEFAULT NOW(),
call_ended_at TIMESTAMP
-- Calculate duration: EXTRACT(EPOCH FROM (call_ended_at - call_started_at))
```
Set call_ended_at when rep clicks "End Call" button.

**Affected:** Database schema (calls table), post-call capture flow, dashboard metrics

---

### 3. Recording Toggle UI/UX Mismatch
**Severity: HIGH**

**Issue:**
Spec says "no actual recording in Phase 1 — just UI toggle" but UI shows "Recording badge (REC with pulsing dot)" — a universal signal of **active recording**. Users will expect actual recording and may have privacy concerns.

**Impact:**
User confusion and potential compliance issues if reps believe they're recording without actually recording.

**Recommendation:**
Remove recording toggle from Phase 1 footer or clearly label as unavailable:
```
Remove: "Recording badge (REC with pulsing dot)"
Defer all recording features to Phase 2
```

**Affected:** Screen 2 footer UI, feature list

---

### 4. Post-Call Capture — Timing & Mandatory Requirements Undefined
**Severity: HIGH**

**Issue:**
No definition of:
- Is capture mandatory or optional?
- Can reps close the app without capturing?
- What happens if they click "End Call" but don't fill the form?
- Is captured data lost if they navigate away?

**Impact:**
Data loss risk. Reps may lose call data if requirements are unclear.

**Recommendation:**
Define capture flow explicitly:
```
Step 8 → Click "End Call" → Modal form (cannot dismiss without save or explicit "Discard")
Required fields: prospect_name, company_name, outcome
Optional: system_named (if path_taken='A'), objections_handled, outcome_notes
```

**Affected:** Screen 2 (End Call action), Screen 4 (capture form), flow documentation

---

### 5. Error Handling & Network Resilience — Completely Undefined
**Severity: HIGH**

**Issue:**
Spec provides Supabase query syntax but ZERO error handling:
- What if Supabase is unreachable mid-call?
- What if insert fails (constraint violation, RLS denial)?
- What are error messages to users?
- Can call screen work offline?
- What happens to unsaved data on network failure?

**Impact:**
App will crash or hang with no recovery. Rep mid-call with no guidance. Potential data loss.

**Recommendation:**
Add error handling strategy:
```
All queries wrapped in try/catch:
- Network error → Toast: "Connection lost. Check internet." + Retry button
- RLS denial → Redirect to login (shouldn't happen, log for debugging)
- Constraint violation → Show field-specific error in form
- Script loading fails → Pre-cache on app init, show cached data offline
```

**Affected:** All Supabase query sections, all screen specs (add error states), hooks

---

## High-Risk Findings

### 6. Resistance Handlers Display Logic
**Severity: MEDIUM**

**Issue:**
Spec shows "3 handlers" in sidebar but doesn't specify which 3 or how they're selected. Database allows unlimited handlers. No sort order defined.

**Recommendation:**
Clarify sidebar:
```
Display: All handlers from resistance_handlers table
Sort: By creation order (or allow future: by usage frequency)
For Phase 1: Fix to the 3 seeded handlers (too_busy, already_invested, no_budget)
```

**Affected:** Screen 2 (Drawer sidebar), database schema, component logic

---

### 7. Dashboard Query — Pagination Missing
**Severity: MEDIUM**

**Issue:**
Spec hardcodes `.limit(50)` but doesn't define pagination. For active reps (30 calls/day), 50 calls = 1.5 days history. Stale quickly with no way to page back.

**Recommendation:**
Implement pagination:
```javascript
// Paginate by 20 calls/page
.range(pageIndex * 20, (pageIndex + 1) * 20 - 1)
// Show "Load More" or prev/next page controls
```

**Affected:** Screen 5 (Dashboard), query spec, call history component

---

### 8. SOS Tips Storage Mechanism Undefined
**Severity: MEDIUM**

**Issue:**
Spec mentions "step-specific tips (pre-written)" but no storage mechanism. Not in database schema. Are they hardcoded? Reuse delivery_tip?

**Recommendation:**
Simplest approach: reuse `call_scripts.delivery_tip`
```
SOS button → Show current step's delivery_tip in drawer
No separate table needed
```

**Affected:** Screen 2 (SOS button), database, component logic

---

## Missing Information

1. **Prospect Answer Capture** — How does Step 3 capture what the prospect said?
2. **Call Duration Timing** — Start/end timestamps or manual entry?
3. **Error Handling** — Network failures, validation errors, RLS denials
4. **Empty States** — UI for dashboard with no calls, missing scripts/handlers
5. **Timezone Handling** — Are timestamps UTC? How to show "today"?
6. **Seed Data Completeness** — Only Steps 1-4 shown, need all 8 steps
7. **Objections "Other"** — Form shows "other" checkbox but schema doesn't define it
8. **Accessibility** — No mention of keyboard nav, ARIA labels, screen readers

---

## Contradictions

1. **Screen 2 includes "Transcript" tab** (line 159) but no transcript data is captured during the call. This is deferred to Phase 2 (speech recognition).
   - **Fix:** Remove "Transcript" tab from Phase 1. Show only "Resistance Handlers" and "SOS Tips" tabs.

2. **Recording toggle shows pulsing dot** (active recording UI) but no actual recording happens.
   - **Fix:** Remove from Phase 1 or label clearly as "Coming soon"

---

## Risk Scores

| Area | Risk | Notes |
|---|---|---|
| **Architecture** | LOW | React + Supabase + Tailwind proven stack. Component structure clear. |
| **Data Safety** | MEDIUM | RLS protects user isolation. New project (no migrations). Call duration capture undefined. |
| **Frontend/Backend Alignment** | HIGH | Step 4 branching data source undefined. Call duration mechanism missing. Post-call flow ambiguous. |
| **Error Handling** | HIGH | No network resilience. No error response definitions. |
| **Performance** | LOW | Small scale. No N+1 queries. Index defined on calls(user_id, call_date). |
| **Security** | MEDIUM | RLS in place. Auth via Supabase. Missing: admin model, seed data validation. |
| **Operational** | MEDIUM | Seed data incomplete. Timezone handling undefined. Monitor strategy absent. |
| **Timeline** | MEDIUM | 1–2 weeks is tight. Critical issues above should be resolved before coding starts. |

---

## Release Readiness Checklist

- [ ] **Prospect Answer** — Step 3 UI specifies how prospect's system name is captured
- [ ] **Call Duration** — Auto-timestamp mechanism defined (call_started_at / call_ended_at)
- [ ] **Error Handling** — Network, validation, and RLS error strategies documented
- [ ] **Recording UI** — Removed from Phase 1 or clearly marked unavailable
- [ ] **Post-Call Flow** — Capture is mandatory, required fields defined, form validation rules explicit
- [ ] **Empty States** — UI defined for dashboard with 0 calls, missing scripts/handlers
- [ ] **Pagination** — Dashboard query changed from limit(50) to paginated
- [ ] **Seed Data** — All 8 steps completed (currently shows only 1-4)
- [ ] **SOS Tips** — Storage mechanism defined (recommend reuse delivery_tip)
- [ ] **Timezone** — UTC storage + display conversion strategy documented
- [ ] **Accessibility** — Keyboard nav, ARIA labels, color contrast checklist added

---

## Recommended Resolution Priority

**Before Implementation (1-2 hours):**
1. Add prospect answer capture to Step 3 UI
2. Add call_started_at / call_ended_at to calls schema
3. Remove recording toggle from Phase 1
4. Define post-call capture as mandatory with required fields
5. Complete all 8 step seed data

**During Planning:**
1. Define error handling strategy for all Supabase queries
2. Design empty states for dashboard and call screens
3. Implement pagination (20 calls/page)
4. Clarify SOS tips (reuse delivery_tip)

**During Implementation:**
1. Test RLS with multi-user scenarios
2. Verify call_duration calculation after capture
3. Manual test branching flow (answer → path selection)
4. Test network failure recovery

---

## Sign-off
**Status: READY WITH CHANGES**

Proceed to implementation planning once the 5 "Before Implementation" items above are addressed. The spec is strong overall; these are clarifications, not redesigns.

Estimated spec revision time: 1-2 hours
Estimated implementation time post-spec: 8-10 days
Timeline achievable if changes made before coding begins.
