# Database Setup — Cold Call Guide Tool Phase 1

**Status:** Ready to Deploy  
**Database:** Supabase PostgreSQL  
**Last Updated:** 2026-06-09

---

## Instructions

1. Open Supabase SQL editor (supabase.com → your project → SQL Editor)
2. Create a new query
3. Copy **all SQL from Section 1 below** (CREATE TABLE statements)
4. Paste into Supabase SQL editor
5. Click "Run" button
6. Verify: All 4 tables created successfully
7. Copy **all SQL from Section 2** (Seed Data)
8. Paste into new SQL query
9. Click "Run"
10. Copy **all SQL from Section 3** (RLS Policies)
11. Paste into new SQL query
12. Click "Run"
13. Verify checklist at bottom

**⚠️ IMPORTANT:** Run sections in order: Section 1 → Section 2 → Section 3

---

## Section 1: Create Tables

```sql
-- Cold Call Guide Tool Database Schema
-- Phase 1 Initial Setup
-- Created: 2026-06-09

-- Table 1: users (synced with Supabase Auth)
-- This table references auth.users and stores additional user data
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: call_scripts (Read-only reference data)
-- Stores the 7-step cold call script template
CREATE TABLE IF NOT EXISTS call_scripts (
  id SERIAL PRIMARY KEY,
  step_number INTEGER NOT NULL UNIQUE,
  step_title TEXT NOT NULL,
  goal TEXT NOT NULL,
  script_text TEXT NOT NULL,
  timer_seconds_min INTEGER,
  timer_seconds_max INTEGER,
  delivery_tip TEXT,
  path_a_content TEXT,  -- Content for Path A (system named)
  path_b_content TEXT,  -- Content for Path B (manual/paper)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: resistance_handlers (Read-only reference data)
-- Stores objection handling responses
CREATE TABLE IF NOT EXISTS resistance_handlers (
  id SERIAL PRIMARY KEY,
  handler_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: calls (Main transactional table)
-- Stores individual call records
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Pre-call metadata
  prospect_name TEXT,
  company_name TEXT,
  
  -- Call timing
  call_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  call_started_at TIMESTAMP WITH TIME ZONE,
  call_ended_at TIMESTAMP WITH TIME ZONE,
  call_duration_seconds INTEGER,
  
  -- Call flow
  path_taken TEXT CHECK (path_taken IN ('A', 'B')),
  system_named TEXT,  -- Only if path_taken = 'A'
  
  -- Objections & notes
  objections_handled TEXT[],  -- Array of handler keys
  outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('booked', 'follow_up', 'not_interested', 'pending')),
  outcome_notes TEXT,
  
  -- Metadata
  recording_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calls_user_date ON calls(user_id, call_date DESC);
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON calls(outcome);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);

```

---

## Section 2: Seed Data

```sql
-- Seed data for Cold Call Guide Tool
-- Based on QA_Manager_Cold_Call_Scripts_Covaris.pdf

-- Seed Table 1: call_scripts (7 main steps of the cold call script)
INSERT INTO call_scripts (
  step_number, step_title, goal, script_text, timer_seconds_min, timer_seconds_max,
  delivery_tip, path_a_content, path_b_content
) VALUES

(1, 'The Authority Intro', 
 'Establish your identity cleanly without sounding like a standard sales rep',
 'Hi [Name], this is [Your Name], co-founder of Orcanos. I know you weren''t expecting my call, do you have a brief moment?',
 5, 10,
 'Speak slowly and naturally. Avoid overly enthusiastic sales greetings.',
 NULL, NULL),

(2, 'The Core Value Proposition & Orientation',
 'Give the prospect immediate context so they understand exactly who you are and what your company does',
 'Thank you. I''m personally leading our expansion here in the US, reaching out to QA leaders because we provide a single, unified platform that connects your QMS directly with your product and engineering requirements. I''m reaching out to get a pulse on how teams in the region are balancing their compliance.',
 10, 20,
 'Be clear and direct. This is one-sentence definition. Don''t oversell.',
 NULL, NULL),

(3, 'The Diagnostic Leading Question',
 'Turn the pitch into a peer-to-peer consultation and gather immediate intelligence on their setup',
 'Quick question for you: What are you currently running for your eQMS setup?',
 20, 40,
 'Speak naturally. This is a genuine question, not a pitch. Listen carefully to their answer and take notes.',
 NULL, NULL),

(4, 'The Macro-Pain Frame',
 'Validate their choice and highlight The Isolation Trap and The Customization Tax',
 'Perfect. That''s a very common platform, and it handles basic compliance well. But the reason we built Orcanos is to address two massive headaches I see across the medical device space: the isolation trap and the customization tax. First, traditional eQMS systems sit in a silo. They handle basic documents, some quality processes, but they don''t touch actual engineering, design controls, or manufacturing. Teams spend a fortune on them, but engineers are still stuck using Excel for BOM tracking, SharePoint for DHFiles, and separate tools for training, complaints, assets. So highly paid quality engineers waste hours acting as manual data cables between systems. Second, your processes constantly evolve. With legacy systems, every time you update an SOP, you have to pay thousands of dollars for slow, expensive external customizations just to tweak a simple form or workflow. Does that customization tax or system-switching ring a bell with your current setup, or are they letting you make those changes internally?',
 40, 120,
 'Drop your pitch energy. Ask casually, like you''re genuinely curious. This is a two-way conversation.',
 'Perfect. That''s a very common platform, and it handles basic compliance well. But the reason we built Orcanos is to address two massive headaches I see across the medical device space: the isolation trap and the customization tax. First, traditional eQMS systems sit in a silo. They handle basic documents, some quality processes, but they don''t touch actual engineering, design controls, or manufacturing. Teams spend a fortune on them, but engineers are still stuck using Excel for BOM tracking, SharePoint for DHFiles, and separate tools for training, complaints, assets. So highly paid quality engineers waste hours acting as manual data cables between systems. Second, your processes constantly evolve. With legacy systems, every time you update an SOP, you have to pay thousands of dollars for slow, expensive external customizations just to tweak a simple form or workflow. Does that customization tax or system-switching ring a bell with your current setup, or are they letting you make those changes internally?',
 'Honestly? That is actually great news, and you are in a much stronger strategic position than you think. Usually, growing medical device firms think the next step is to buy a standard, legacy eQMS. And while those systems can handle standard document control and quality processes, they leave your QA and RA engineers completely stranded when it comes to the actual product development side. They don''t touch your design controls. You buy one, and your team is still stuck manually managing system requirements, complex traceability matrices, risk management, and V&V inside disconnected Excel spreadsheets and SharePoint folders. On top of that, as your startup grows and your processes change, those systems lock you in. Every time you need to tweak a workflow to fit a new SOP, legacy vendors hit you with massive, expensive customization fees. Does that administrative headache of your engineering team managing requirements in Word, risk in Excel, and files in SharePoint ring a bell, or are you trying to find a way to automate all of that under one roof from the start?'),

(5, 'The Consultative Pause',
 'Break up the monologue, shift the power dynamic, and get active psychological buy-in',
 'Do you mind if I share a quick, real-world story of how a peer company handled this exact transition?',
 5, 10,
 'Lower your voice slightly, slow down, and sound casual. Wait for them to say "Sure" or "Go ahead."',
 NULL, NULL),

(6, 'The Proof',
 'Use heavy, aggressive volume metrics and ROI data to prove enterprise-level credibility',
 'We recently deployed our unified architecture for Covaris, a complex medical device division under PerkinElmer. To give you an idea of scale, they manage a massive operation: over 500 sellable products, 8,000 active parts, and more than 10,000 controlled documents. They were heavily fragmented—running 3 to 4 disconnected legacy systems, and their previous eQMS was meeting only 22% of their actual operational needs. It was so bad they were processing over 5,000 manual training events a year just to keep up with minor document changes. By migrating their entire ecosystem into our flexible platform, we completely eliminated four full-time positions'' worth of pure administrative paperwork waste. Their leadership reallocated those 4 FTEs straight back into actual quality engineering and product innovation. Because everything was unified, they recently passed four consecutive FDA audits in a ten-day window with zero back-room preparation or scrambling—the auditors just viewed the live system.',
 10, 30,
 'Use real examples and specific numbers. Specificity builds trust.',
 NULL, NULL),

(7, 'The Final Soft Hook',
 'Secure a peer-to-peer executive briefing, not a sales demo',
 '[Path A] I''m curious—even with your current eQMS setup, are your quality engineers still losing hours managing data across separate spreadsheets and folders to bridge those design and manufacturing gaps? [Path B] Since you are looking at how to scale your infrastructure right now without drowning in manual paperwork, I''d love to personally share the technical blueprint of how we structured that transition. Let''s grab a brief, 15-minute introductory conversation next week leader-to-leader, just to put this architecture on your radar. How does your calendar look next Tuesday or Thursday?',
 10, 20,
 'Ask a tailored curiosity question based on their path. Assume they want to meet—give them two options, don''t ask if they want to meet.',
 'I''m curious—even with your current eQMS setup, are your quality engineers still losing hours managing data across separate spreadsheets and folders to bridge those design and manufacturing gaps?',
 'Since you are looking at how to scale your infrastructure right now without drowning in manual paperwork, I''d love to personally share the technical blueprint of how we structured that transition.');

-- Seed Table 2: resistance_handlers (3 common objections & responses)
INSERT INTO resistance_handlers (handler_key, title, response_text) VALUES

('too_busy',
 'Too busy / Middle of a major project',
 'I completely respect that. If a QA leader told me they weren''t buried in a project, I''d be shocked. But let me challenge that for a second: the very reason your engineering team is so busy is likely because they are stuck maintaining 3 or 4 disconnected systems. When we took Covaris over to a single platform, we permanently cut out 4 full-time positions'' worth of pure data-entry noise. I''m not asking for a major software project kickoff today. Let''s protect your time—I can send over a brief 90-second screen recording showing how they manage 8,000 parts and 10,000 documents natively in one view. Review it whenever you get a breather. Fair enough?'),

('already_invested',
 'We already spent a lot of money and time on our current system',
 'I expect nothing less; you have to have a system in place. But what I usually find is that companies have a QMS for compliance, but they are still using separate tools or spreadsheets for PLM, BOM tracking, and training. They are paying multiple software subscriptions, and their engineers are stuck acting as the manual bridge between them. We aren''t looking to just add another tool; we look to replace those 3 or 4 fragmented systems into one single platform. Is your current system handling 100% of your product lifecycle from requirements and design to parts, or is your team still bridging those engineering gaps manually with Excel?'),

('no_budget',
 'We don''t have the budget for a new platform right now',
 'I completely understand—every corporate dollar is being tightly scrutinized right now. But as a founder, let me give you the operational math: this isn''t a cost center, it''s an immediate cost-saving play. When we consolidated those systems for Covaris, it was a highly efficient $25K setup that immediately stopped them from having to hire 5 new people, saving them $455K in overhead. It instantly clawed back 4 FTEs'' worth of wasted time. I''m not trying to sell you something for this quarter''s budget. Let''s just spend 15 minutes looking at the architecture so you have the benchmark numbers for your next fiscal planning cycle. Would next Tuesday work?');

```

---

## Section 3: Enable Row Level Security (RLS)

```sql
-- Row Level Security Policies
-- Ensures users can only see/modify their own calls

-- Enable RLS on calls table
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own calls
CREATE POLICY "Users can read their own calls"
  ON calls
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own calls
CREATE POLICY "Users can insert their own calls"
  ON calls
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own calls
CREATE POLICY "Users can update their own calls"
  ON calls
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own calls
CREATE POLICY "Users can delete their own calls"
  ON calls
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on call_scripts and resistance_handlers (read-only for all users)
ALTER TABLE call_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resistance_handlers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read call_scripts
CREATE POLICY "Anyone can read call_scripts"
  ON call_scripts
  FOR SELECT
  USING (TRUE);

-- Policy: Anyone can read resistance_handlers
CREATE POLICY "Anyone can read resistance_handlers"
  ON resistance_handlers
  FOR SELECT
  USING (TRUE);

```

---

## Verification Checklist

After running all three sections, verify by running these queries:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check call_scripts has 7 rows
SELECT COUNT(*) as script_count FROM call_scripts;
-- Should return: 7

-- Check resistance_handlers has 3 rows
SELECT COUNT(*) as handler_count FROM resistance_handlers;
-- Should return: 3

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename = 'calls';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('calls', 'call_scripts', 'resistance_handlers');
-- Should return: rowsecurity = true for all three

```

---

## Tables Created

| Table | Rows | Purpose |
|---|---|---|
| `users` | 0 (synced with auth.users) | User account data |
| `call_scripts` | 7 | 7-step cold call script (read-only) |
| `resistance_handlers` | 3 | Objection handling responses (read-only) |
| `calls` | 0 | Individual call records (transactional) |

---

## Indexes Created

| Index | Table | Columns | Purpose |
|---|---|---|---|
| `idx_calls_user_date` | calls | (user_id, call_date DESC) | Dashboard queries |
| `idx_calls_outcome` | calls | (outcome) | Metrics calculation |
| `idx_calls_user_id` | calls | (user_id) | User isolation |

---

## Foreign Keys

| Table | Column | References | On Delete |
|---|---|---|---|
| users | id | auth.users(id) | CASCADE |
| calls | user_id | auth.users(id) | CASCADE |

---

## Row Level Security Policies

| Table | Policy | Condition |
|---|---|---|
| calls | SELECT | auth.uid() = user_id |
| calls | INSERT | auth.uid() = user_id |
| calls | UPDATE | auth.uid() = user_id |
| calls | DELETE | auth.uid() = user_id |
| call_scripts | SELECT | TRUE (public read) |
| resistance_handlers | SELECT | TRUE (public read) |

---

## Important Notes

1. **auth.users integration:** The `users` table references Supabase's built-in `auth.users` table. When a user signs up via Supabase Auth, a row is created in `auth.users`. The calls table references this via `user_id`.

2. **Seed data is from PDF:** All 7 scripts and 3 resistance handlers are directly from QA_Manager_Cold_Call_Scripts_Covaris.pdf.

3. **RLS enforcement:** All calls queries are automatically scoped by `auth.uid()`. A user trying to access another user's calls will get an empty result (SELECT) or error (UPDATE/DELETE).

4. **Indexes critical for performance:** The `idx_calls_user_date` index is essential for the dashboard query that sorts calls by date. Without it, queries will slow down as more calls accumulate.

5. **call_started_at / call_ended_at:** These are timestamped by the app when "Start Call" is clicked and when "End Call" is confirmed. They enable precise call duration calculation.

6. **Prospect and company name:** Captured at the start of the call in the Home screen.

---

## Troubleshooting

**Error: "relation does not exist"**
- Ensure Section 1 (CREATE TABLE) ran successfully
- Verify table names are lowercase

**Error: "foreign key constraint"**
- Ensure Supabase Auth is enabled for your project
- User must exist in auth.users before inserting into calls

**Error: "row level security policy"**
- Ensure Section 3 (RLS policies) ran successfully
- RLS must be enabled on the calls table

**Seed data not appearing**
- Ensure Section 2 (INSERT statements) ran successfully
- Query the table: `SELECT * FROM call_scripts;`

**Metrics showing 0**
- Ensure at least one call exists with `call_started_at` and `call_ended_at` timestamps
- Ensure outcome is not 'pending' (dashboard only counts completed calls)

---

## Next Steps

1. ✅ Run all three SQL sections above
2. ✅ Verify all tables, indexes, and RLS policies created
3. ✅ Note your Supabase URL and Anon Key (in Project Settings)
4. ✅ Add credentials to `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
   ```
5. ✅ Proceed to Phase 2: Infrastructure setup (Vite + React)

---

**Database Setup Complete!** 🎉
