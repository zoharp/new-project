# Cold Call Guide Tool — PDF Updates & Enhancements

**Status:** ✅ Code Changes Complete  
**Date:** 2026-06-09  
**Dev Server:** Running on http://localhost:3001  
**Next Step:** Execute database-setup.md in Supabase

---

## Summary of Changes

### 1. ✅ Prospect & Company Name Capture (Home Page)

When a user clicks "Start Call", they now fill in:
- **Prospect Name** (e.g., "John Smith")
- **Company Name** (e.g., "Acme Medical Devices")

These fields are captured in the database for better call tracking.

```
Home.jsx updates:
- Added useState for prospectName and companyName
- Added input fields with placeholders
- Pass data to createCall() hook
```

### 2. ✅ System Name is Now Optional

Users can now select **Path A** (they named a system) without entering a system name.
- If they enter a system name, it's saved
- If they skip it, it's null (no error)

```
BranchingScreen.jsx updates:
- Removed validation alert
- Added "(optional)" label
- Added example system names: TrackWise, Arena, MasterControl, Greenlight
```

### 3. ✅ Updated to 7-Step Call Flow (from 8)

The script is now **7 steps** instead of 8:

1. **The Authority Intro** — Establish identity (0-10s)
2. **The Core Value Proposition & Orientation** — Why you're calling (10-20s)
3. **The Diagnostic Leading Question** — What system do they use? (20-40s)
4. **The Macro-Pain Frame** — Highlight pain (Path A or B) (40-120s)
5. **The Consultative Pause** — Ask permission to share story (5-10s)
6. **The Proof** — Case study: Covaris metrics & ROI (10-30s)
7. **The Final Soft Hook** — Close with 15-min meeting request (10-20s)

Updated files:
- `CallScreen.jsx` — Logic for step 7 exit, display "of 7"
- `ScriptDisplay.jsx` — Display "of 7"
- `Home.jsx` — Description updated

### 4. ✅ All Scripts & Delivery Tips from PDF

All 7 steps now have **exact text from the PDF**:

**Example — Step 4 Path A Content:**
> "Perfect. That's a very common platform, and it handles basic compliance well. But the reason we built Orcanos is to address two massive headaches I see across the medical device space: the isolation trap and the customization tax..."

**Example — Step 4 Path B Content:**
> "Honestly? That is actually great news, and you are in a much stronger strategic position than you think. Usually, growing medical device firms think the next step is to buy a standard, legacy eQMS..."

### 5. ✅ Enhanced Delivery Tips Display

ScriptDisplay component now shows delivery tips prominently:

**Before:**
- 💡 Small italic text at bottom

**After:**
- 💡 **Delivery Tip:** [bold header]
- Amber/gold styling for visual prominence
- Appears ABOVE script text (not below)
- Clear visual hierarchy

### 6. ✅ 3 Resistance Handlers from PDF

Ready to use when prospects push back:

1. **"Too busy / Middle of a major project"**
   - Response: "I completely respect that. If a QA leader told me they weren't buried in a project, I'd be shocked. But let me challenge that..."

2. **"We already spent money on our current system"**
   - Response: "I expect nothing less; you have to have a system in place. But what I usually find is that companies have a QMS for compliance..."

3. **"We don't have the budget right now"**
   - Response: "I completely understand—every corporate dollar is being tightly scrutinized right now. But as a founder, let me give you the operational math..."

---

## What Changed in Code

### Files Modified:

1. **src/pages/Home.jsx**
   - Added prospect_name input
   - Added company_name input
   - Pass to createCall()

2. **src/hooks/useCall.js**
   - Updated createCall(userId, callData = {})
   - Accept prospect_name and company_name

3. **src/components/Call/CallScreen.jsx**
   - Changed step logic: 7 instead of 8
   - Updated display: "Step X of 7"
   - Fixed handleNext logic for step 7

4. **src/components/Call/ScriptDisplay.jsx**
   - Display "Step X of 7"
   - Moved delivery tips to top with better styling
   - Enhanced "Pause & Listen" section
   - Better script text formatting (quotes, whitespace)

5. **src/components/Call/BranchingScreen.jsx**
   - Made system_name optional
   - Added label "(optional)"
   - Added example system names

6. **design/database-setup.md**
   - Updated seed data: 7 scripts (not 8)
   - All scripts use exact PDF text
   - 3 resistance handlers from PDF
   - Same table structure, just new content

7. **CLAUDE.md**
   - Updated to reflect PDF integration
   - Changed 8-step to 7-step
   - Noted prospect/company capture

---

## What Happens Next

### ⏳ Database Update Required

The database still has the OLD scripts (8 steps, generic text). You need to:

1. **Drop the old seed data:**
   ```sql
   DELETE FROM call_scripts WHERE step_number > 0;
   DELETE FROM resistance_handlers WHERE id > 0;
   ```

2. **Copy Section 2 from `design/database-setup.md`**
   - All 7 new scripts with PDF text
   - 3 resistance handlers with PDF responses

3. **Paste into Supabase SQL editor and run**

### ✅ After DB Update, You Can:

- Start a call and enter prospect/company name
- Get guided through all 7 PDF steps with delivery tips
- Select Path A or B at Step 4
- See Covaris case study in Step 6
- Access all 3 resistance handlers in the drawer

---

## Example Flow (After DB Update)

```
1. User lands on Home
   → Enters "John Smith" as prospect name
   → Enters "Medtech Corp" as company name
   → Clicks "Start Call"

2. Sees Step 1: Authority Intro
   → Script: "Hi John, this is [Your Name]..."
   → Delivery Tip: "Speak slowly and naturally. Avoid overly enthusiastic sales greetings."
   → Timer: 0-10 seconds
   → Clicks "Next Step →"

3. Sees Step 2: Core Value Prop
   → Script: "Thank you. I'm personally leading our expansion..."
   → Clicks "Next Step →"

4. Sees Step 3: Diagnostic Question
   → Script: "Quick question for you: What are you currently running for your eQMS setup?"
   → Clicks "Next Step →"

5. Gets branching screen
   → Path A: "They named a system (e.g., TrackWise)"
   → Path B: "They use paper/Excel/SharePoint"
   → User picks Path A, optionally enters "TrackWise"
   → Clicks "They named a system →"

6. Sees Step 4: Macro-Pain Frame
   → Script customized for Path A (talks about isolation trap)
   → Clicks "Next Step →"

... continues through Step 5, 6, 7, then post-call form
```

---

## Dev Server Status

✅ Running on http://localhost:3001  
✅ All changes loaded via Hot Module Reload  
✅ Ready to test once database is updated  

---

## Next Actions

1. ✅ Code changes complete
2. ⏳ Execute database SQL in Supabase (see design/database-setup.md Section 2)
3. ✅ Test the flow manually
4. ✅ Demo to stakeholders

---

**Questions?**
- All 7 steps have exact text from the PDF
- Delivery tips are context-aware for each step
- Resistance handlers cover the top 3 objections from the PDF
- System name is optional (prospects might not name one)
- Prospect/company fields help with call tracking and follow-ups

