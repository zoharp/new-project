# Implementation Plan: Cold Call Guide Tool — Phase 1

**Timeline:** 10 business days (2 weeks)  
**Team:** 1 Full-Stack Engineer  
**Status:** Ready for Implementation

---

## Executive Summary

Build a focused React + Supabase web app that guides Orcanos sales reps through an 8-step cold call script with real-time objection handling and post-call analytics. Phase 1 prioritizes core call flow and dashboard metrics; Phase 2 defers speech recognition and advanced coaching.

---

## Phase 1: Spec Clarifications (Pre-Implementation)
**Duration:** 1-2 hours  
**Owner:** Product/Design

### Tasks
1. **Add prospect answer capture to Step 3**
   - Spec currently lacks input field for prospect's system name
   - Add textarea to Step 3 UI: "What system/tool did they mention?"
   - Required before Next Step button enables
   
2. **Define call duration capture**
   - Add `call_started_at` and `call_ended_at` to calls schema
   - Set on "Start Call" and "End Call" actions
   - Calculate duration in seconds client-side for dashboard
   
3. **Remove recording UI from Phase 1**
   - Delete "Recording badge (REC with pulsing dot)" from footer
   - Move all recording features to Phase 2
   - Avoid user confusion about non-functional UI
   
4. **Define post-call capture requirements**
   - Capture is mandatory on "End Call"
   - Required fields: prospect_name, company_name, outcome
   - Optional fields: system_named (if path A), objections_handled, outcome_notes
   - Form cannot be dismissed without save or explicit "Discard"
   
5. **Complete seed data for all 8 steps**
   - Expand call_scripts INSERT statements (currently shows only Steps 1-4)
   - Include all delivery tips, timers, and goal statements
   - Path A/B content for Step 4

6. **Define error handling strategy**
   - Network failures: show toast + retry button
   - Validation errors: field-level error messages
   - RLS denials: redirect to login
   - All Supabase queries wrapped in try/catch

---

## Phase 2: Foundation & Infrastructure
**Duration:** 1 day  
**Owner:** Engineer

### Tasks
1. **Create Supabase project**
   - Create organization project
   - Enable authentication (email/password)
   - Configure environment variables
   - Store VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY in .env

2. **Create React + Vite project**
   ```bash
   npm create vite@latest cold-call -- --template react
   cd cold-call
   npm install
   ```

3. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js tailwindcss postcss autoprefixer react-router-dom
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Configure Tailwind CSS**
   - Update tailwind.config.js with content paths
   - Configure theme colors (info blue for CTAs, secondary for muted)
   - Set up responsive design breakpoints

5. **Setup Git repository**
   - Initialize git
   - Configure .gitignore (.env, node_modules, dist)
   - Create main branch

6. **Create directory structure**
   ```
   src/
   ├── components/
   │   ├── Auth/ (LoginForm, SignupForm)
   │   ├── Call/ (CallScreen, ScriptDisplay, BranchingScreen, PostCallCapture, Drawer)
   │   ├── Dashboard/ (Dashboard, MetricsCard, CallHistory, CallDetailModal)
   │   └── Layout/ (Header, ProtectedRoute, Footer)
   ├── context/ (AuthContext, CallContext)
   ├── hooks/ (useAuth, useCall, useScripts)
   ├── lib/ (supabase.js)
   ├── pages/ (Home, CallPage, DashboardPage, LoginPage)
   ├── styles/ (globals.css, tailwind directives)
   ├── App.jsx
   └── main.jsx
   ```

---

## Phase 3: Database Setup
**Duration:** 0.5 day  
**Owner:** Engineer

### Tasks
1. **Create tables in Supabase**
   - users (id, email, created_at)
   - calls (id, user_id, prospect_name, company_name, call_date, call_duration_seconds, call_started_at, call_ended_at, path_taken, system_named, objections_handled, outcome, outcome_notes, recording_enabled, created_at, updated_at)
   - call_scripts (id, step_number, step_title, goal, script_text, timer_seconds_min, timer_seconds_max, delivery_tip, path_a_content, path_b_content, created_at)
   - resistance_handlers (id, handler_key, title, response_text, created_at)

2. **Create index on calls table**
   - idx_calls_user_date ON calls(user_id, call_date DESC)
   - Optimize dashboard queries

3. **Enable Row Level Security**
   - ALTER TABLE calls ENABLE ROW LEVEL SECURITY
   - CREATE POLICY "Users can read/write their own calls"
   - call_scripts and resistance_handlers: public read-only

4. **Seed reference data**
   - Insert all 8 call_scripts steps (from spec)
   - Insert 3 resistance_handlers (too_busy, already_invested, no_budget)

---

## Phase 4: Authentication & Core Components
**Duration:** 2 days  
**Owner:** Engineer

### Subtask 4.1: Auth Infrastructure (1 day)
1. **Create AuthContext**
   - useAuth hook to manage user state
   - Session detection on app load
   - Supabase auth listeners for user changes

2. **Create LoginForm component**
   - Email/password inputs
   - Form validation
   - Error handling (invalid credentials, network issues)
   - Link to SignupForm

3. **Create SignupForm component**
   - Email/password inputs with confirmation
   - Password strength validation
   - Duplicate account detection
   - Success → redirect to Home

4. **Create ProtectedRoute component**
   - Redirect unauthenticated users to LoginPage
   - Load user state before rendering protected pages

5. **Create Header component**
   - Logo/title
   - User email display
   - Logout button
   - Navigation (Home, Dashboard)

### Subtask 4.2: Home & Core Pages (1 day)
1. **Create LoginPage**
   - Route: /login
   - LoginForm + SignupForm tabs
   - Redirect if already authenticated

2. **Create Home page**
   - Route: / (protected)
   - Simple card: "Ready to call?"
   - "Start Call" button
   - onClick → POST to calls table, get callId, redirect to /call/:callId

3. **Create CallContext**
   - Manage current call state (callId, currentStep, prospect answer, path_taken)
   - Fetch/update call from Supabase
   - useCall hook to expose context

---

## Phase 5: Call Screen Core UI
**Duration:** 2 days  
**Owner:** Engineer

### Subtask 5.1: Script Display Components (1 day)
1. **Create ScriptDisplay component**
   - Render current step's script content
   - Show: step number (e.g., "Step 3 of 8"), title, goal, script text, timer range, delivery tip
   - Large readable text (18px+), generous spacing
   - Pause marker (animated, info color)

2. **Create PauseMarker component**
   - Animated "pause" icon/text
   - Info blue color
   - Positioned prominently below script

3. **Create Drawer component (sidebar)**
   - Slides in from right on icon click
   - Two tabs: "Resistance Handlers", "SOS Tips"
   - Resistance Handlers tab: List all handlers with response text
   - SOS Tips tab: Show current step's delivery_tip
   - Close button (X) or click outside to close

### Subtask 5.2: Navigation & Controls (1 day)
1. **Create CallScreen component** (main call page)
   - Route: /call/:callId
   - Fetch call from Supabase on mount
   - Fetch all scripts from Supabase on app init (cache)
   - Render ScriptDisplay for current step
   - Footer buttons:
     - Back: Disabled on Step 1, decrements step
     - Next: Advances step, OR at Step 4 shows Path selection
   - Icon buttons: SOS (toggle Drawer), Help (toggle Drawer), timer display

2. **Create step navigation logic**
   - Track currentStep in CallContext
   - Back button: step > 1 ? step - 1 : step (disabled if step === 1)
   - Next button: 
     - Step 1-3, 5-8: step < 8 ? step + 1 : show "End Call" button
     - Step 4: show branching screen (Path A / Path B buttons)

3. **Implement Step 4 branching**
   - Before Step 4 can be shown, check if path_taken is set
   - If not set: redirect to /call/:callId/branch
   - If set: show Step 4 with appropriate content (path_a_content or path_b_content)

---

## Phase 6: Step 4 Branching Screen
**Duration:** 1 day  
**Owner:** Engineer

### Tasks
1. **Create BranchingScreen component**
   - Route: /call/:callId/branch
   - Display prospect's answer: "They said: [prospectAnswer]"
   - Two large buttons:
     - Path A: "They named a system"
     - Path B: "Paper / Excel / Manual"
   - On selection:
     - Update calls.path_taken in Supabase
     - Redirect back to /call/:callId to show Step 4 content
     - Script content loads dynamically from call_scripts (path_a_content or path_b_content)

---

## Phase 7: Post-Call Capture
**Duration:** 1 day  
**Owner:** Engineer

### Tasks
1. **Create PostCallCapture component**
   - Modal or separate page: /call/:callId/capture (or modal on "End Call")
   - Form fields:
     - prospect_name (text, required)
     - company_name (text, required)
     - system_named (text, only if path_taken='A')
     - objections_handled (checkboxes: too_busy, already_invested, no_budget, other)
     - outcome (dropdown: booked, follow_up, not_interested)
     - outcome_notes (textarea, optional)
   - Validation:
     - prospect_name, company_name, outcome are required
     - Show error messages if missing
   - On save:
     - Set call_ended_at to NOW()
     - Calculate call_duration_seconds
     - Update calls table with form data
     - Redirect to dashboard

2. **Integrate with CallScreen**
   - At Step 8, replace "Next" button with "End Call"
   - "End Call" click → show PostCallCapture modal (non-dismissible)
   - User must save or click "Discard" explicitly

---

## Phase 8: Dashboard
**Duration:** 2 days  
**Owner:** Engineer

### Subtask 8.1: Metrics & Dashboard Layout (1 day)
1. **Create Dashboard component**
   - Route: /dashboard (protected)
   - Fetch all calls for current user
   - Calculate metrics:
     - Calls today (count where call_date = today)
     - Booked (count where outcome='booked' AND call_date=today)
     - Conversion rate (booked / calls_today * 100)
     - Avg call length (AVG(call_duration_seconds) for today)
   - Render MetricsCard components for each metric

2. **Create MetricsCard component**
   - Display metric name and value
   - Large, readable typography
   - Color-coded (info blue for CTAs, secondary for muted)
   - Consistent card styling

### Subtask 8.2: Call History & Details (1 day)
1. **Create CallHistory component**
   - Table with columns: Prospect/Company, Outcome (badge), Time
   - Query calls with pagination: 20 calls per page
   - Sort by call_date DESC (most recent first)
   - Click row → show CallDetailModal
   - "Load More" button for pagination

2. **Create CallDetailModal component**
   - Display all call data
   - Show: prospect_name, company_name, outcome, system_named (if path_a), objections_handled, outcome_notes, call_date, call_duration
   - Edit button: allow editing outcome/notes
   - Delete button: remove call from DB (with confirmation)
   - Close button

---

## Phase 9: Error Handling & Resilience
**Duration:** 1 day  
**Owner:** Engineer

### Tasks
1. **Implement error boundaries**
   - Wrap async Supabase calls in try/catch
   - All screens: loading state, error state, success state

2. **Handle network failures**
   - Toast notifications for errors
   - Retry buttons on error screens
   - Prevent app crash on failed queries

3. **Implement error recovery**
   - Script loading fails → use cached scripts or show error
   - Call create fails → show error + redirect to home
   - Update fails → show error + manual save option

4. **Add loading indicators**
   - Skeleton loaders for dashboard
   - Spinner during auth transitions
   - Disable buttons during submission

---

## Phase 10: Styling & Polish
**Duration:** 1 day  
**Owner:** Engineer

### Tasks
1. **Apply Tailwind CSS theming**
   - Info blue (#3B82F6) for CTAs
   - Secondary gray for muted text
   - Consistent spacing (2rem gutters, 1.6–1.8 line height)

2. **Responsive design**
   - Mobile-first approach
   - Test at 768px breakpoint (tablet)
   - Ensure call screen is readable on desktop (large text 18px+)

3. **Accessibility**
   - Keyboard navigation (Tab, Enter, Esc)
   - ARIA labels on buttons and form inputs
   - Color contrast ratio ≥ 4.5:1
   - Focus states on interactive elements

4. **Polish UI**
   - Smooth transitions between steps
   - Drawer animation (slide in from right)
   - Form validation feedback
   - Success/error toast notifications

---

## Phase 11: Testing
**Duration:** 1.5 days  
**Owner:** Engineer

### Tasks
1. **Write unit tests** (~5 tests)
   - Auth context: login, logout, session detection
   - useCall hook: fetch, update call data
   - Call duration calculation

2. **Write integration tests** (~6 tests)
   - Login flow → Home page
   - Home → Start Call → CallScreen
   - Step navigation (back/next)
   - Step 4 branching (select Path A/B)
   - Post-call capture → Dashboard
   - Dashboard metrics calculation

3. **Manual testing**
   - Test on desktop (Chrome, Firefox)
   - Test on tablet (768px viewport)
   - Test network failure recovery
   - Test RLS (users can only see their own calls)

4. **Performance testing**
   - Script load time (app init)
   - Call fetch time
   - Dashboard query time

---

## Phase 12: Deployment & Release
**Duration:** 0.5 day  
**Owner:** Engineer

### Tasks
1. **Configure Vercel deployment**
   - Link GitHub repository
   - Set environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
   - Enable auto-deploy on push to main

2. **Deploy to production**
   - Verify Supabase project is live
   - Push to main branch
   - Vercel deploys automatically
   - Test live URL end-to-end

3. **Update release notes**
   - Document Phase 1 features in release_notes.json
   - Version: 0.1.0
   - Release date: [deployment date]

---

## Timeline (10 Days)

| Phase | Duration | Days |
|---|---|---|
| 1. Spec Clarifications | 1-2 hrs | - |
| 2. Foundation & Infrastructure | 1 day | Day 1 |
| 3. Database Setup | 0.5 day | Day 1 |
| 4. Auth & Core Components | 2 days | Days 2-3 |
| 5. Call Screen Core UI | 2 days | Days 4-5 |
| 6. Step 4 Branching | 1 day | Day 5 |
| 7. Post-Call Capture | 1 day | Day 6 |
| 8. Dashboard | 2 days | Days 7-8 |
| 9. Error Handling | 1 day | Day 8 |
| 10. Styling & Polish | 1 day | Day 9 |
| 11. Testing | 1.5 days | Day 9-10 |
| 12. Deployment | 0.5 day | Day 10 |
| **TOTAL** | **10 days** | **2 weeks** |

---

## Resource Requirements

- **Engineer:** 1 full-stack (React + Node.js + SQL)
- **Tools:**
  - Supabase (free tier sufficient for Phase 1)
  - Vercel (free tier sufficient)
  - VS Code or similar IDE
  - Git + GitHub
  - PostMan or REST client (for API testing)
- **Data:** Seed SQL scripts for call_scripts and resistance_handlers tables

---

## Risk Assessment & Mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| Step 4 branching logic unclear | HIGH | Finalize prospect answer capture before coding |
| Call duration mechanism undefined | HIGH | Add timestamps (call_started_at, call_ended_at) in spec clarification |
| Network failures not handled | HIGH | Implement error boundaries and retry logic in Phase 9 |
| RLS policy misconfiguration | MEDIUM | Test with multiple users; verify cross-user data isolation |
| Supabase performance | LOW | Monitor query times; add indexes as needed |
| Vite build performance | LOW | Monitor bundle size; lazy-load components if needed |
| Timer display accuracy | LOW | Use client-side timers (setInterval); no backend sync needed Phase 1 |

---

## Success Criteria

- [ ] All 5 spec clarifications completed before coding
- [ ] Supabase project live with tables, RLS, and seed data
- [ ] Auth flow working (signup, login, logout)
- [ ] Call screen displays all 8 steps with correct script content
- [ ] Step 4 branching works (prospect answer → path selection → dynamic content)
- [ ] Post-call capture form mandatory, all data saved to DB
- [ ] Dashboard shows correct metrics (calls today, booked, conversion %, avg length)
- [ ] Dashboard call history paginated and sortable
- [ ] Error handling in place (network, validation, RLS)
- [ ] Responsive design tested at 768px breakpoint
- [ ] 11+ tests passing (unit + integration)
- [ ] Deployed to Vercel, live URL functional end-to-end
- [ ] 0.1.0 release notes updated

---

## External Dependencies

- Supabase project (created, seeded)
- GitHub repository (linked to Vercel)
- Vercel account (auto-deployment)
- Node.js 18+ and npm/yarn installed locally

---

## Key Assumptions

1. Prospect answer is captured as text input (Step 3 UI) before branching
2. Call duration is auto-calculated from timestamps (no manual timer)
3. Seed data for all 8 steps is provided before coding starts
4. RLS policy for auth.users is standard (no custom admin roles Phase 1)
5. Email/password auth is sufficient; no SSO or OAuth Phase 1
6. Call history limit of 50 total (20 per page) is acceptable
7. Timezone handling deferred to Phase 2 (UTC assumed for Phase 1)
8. Recording feature completely deferred to Phase 2 (removed from UI)

---

## Go/No-Go Decision

**Status: READY TO PROCEED**

All spec clarifications must be completed before Day 1 coding. Estimated revision time: 1-2 hours.

Once clarifications are complete, this plan is achievable within the 1-2 week timeline with 1 full-stack engineer.
