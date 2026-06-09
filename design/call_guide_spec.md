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
