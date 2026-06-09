# Manual Test Flow — PDF Scripts Integration

**Status:** Ready for Testing  
**App URL:** http://localhost:3001  
**Database:** Updated with 7 new scripts + 3 resistance handlers

---

## Pre-Test Checklist

- ✅ Dev server running on port 3001
- ✅ Database updated with new scripts (7 steps from PDF)
- ✅ Code changes deployed (Home form, BranchingScreen optional field, 7-step logic)
- ✅ Supabase credentials in .env

---

## Step-by-Step Test Flow

### **Phase 1: Sign Up & Home Page**

**1. Navigate to http://localhost:3001**
- Expected: Login page appears
- Evidence: "Sign In" button visible, email/password fields

**2. Click "Sign Up" or similar link**
- Expected: Sign up form appears
- Evidence: Email, password, confirm password fields

**3. Create test account:**
- Email: `test@example.com`
- Password: `TestPassword123!`
- Expected: Account created, redirected to Home page
- Evidence: "Ready to call?" heading appears

---

### **Phase 2: Prospect & Company Capture**

**4. On Home page, verify new form fields:**
- Expected: See two new input fields above "Start Call" button
  - "Prospect Name" (placeholder: "e.g., John Smith")
  - "Company Name" (placeholder: "e.g., Acme Medical Devices")
- Evidence: Both input fields visible and labeled

**5. Fill in prospect details:**
- Prospect Name: `John Doe`
- Company Name: `Acme Medical Devices`
- Expected: Fields accept input without errors
- Evidence: Text appears in fields as you type

**6. Click "Start Call"**
- Expected: Navigate to Step 1 of the call
- Evidence: "Step 1 of 7" header appears (NOT "of 8")

---

### **Phase 3: Step 1 — Authority Intro**

**7. Verify Step 1 display:**

**Header should show:**
- "Step 1 of 7" (verify "of 7", not "of 8")
- "The Authority Intro"
- Timer: "5–10s"

**Script section should display:**
```
"Hi [Name], this is [Your Name], co-founder of Orcanos. I know you weren't 
expecting my call, do you have a brief moment?"
```

**Delivery Tip should appear:**
- 💡 **Delivery Tip:** (in amber/gold box above script)
- Text: "Speak slowly and naturally. Avoid overly enthusiastic sales greetings."

**Goal should show:**
- "Establish your identity cleanly without sounding like a standard sales rep"

- Expected: All content visible and formatted correctly
- Evidence: Script matches PDF exactly, delivery tip prominent

**8. Click "Next Step →"**
- Expected: Navigate to Step 2
- Evidence: "Step 2 of 7" appears

---

### **Phase 4: Step 2 & 3 — Navigation**

**9. Step 2 should show:**
- Title: "The Core Value Proposition & Orientation"
- Timer: "10–20s"
- Script starting with: "Thank you. I'm personally leading our expansion..."
- Delivery Tip: "Be clear and direct. This is one-sentence definition. Don't oversell."

**10. Click "Next Step →" to go to Step 3**
- Expected: Step 3 loads
- Title: "The Diagnostic Leading Question"
- Script: "Quick question for you: What are you currently running for your eQMS setup?"
- Delivery Tip: "Speak naturally. This is a genuine question, not a pitch. Listen carefully to their answer and take notes."

**11. Click "Next Step →"**
- Expected: Navigate to branching screen (NOT Step 4 directly)

---

### **Phase 5: Branching Screen (Step 4 Decision)**

**12. Verify branching screen appears:**
- Expected: Two path options visible
- Evidence: 
  - Path A box (blue) with title "Path A: Named System"
  - Path B box (gray) with title "Path B: Manual/Paper"

**13. In Path A box, verify:**
- Description: "They mentioned a specific tool (TrackWise, Arena, MasterControl, Greenlight, etc.)"
- Input field labeled: "System Name (optional)"
- ✅ **Key: Field should say "(optional)" — NOT required**
- Placeholder: "Enter system name (e.g., TrackWise, Arena)"
- Button: "They named a system →"

**14. Test Path A WITHOUT system name (Optional Field Test):**
- Leave system name field EMPTY
- Click "They named a system →"
- Expected: ✅ Proceed to Step 4 without error
- Evidence: Step 4 loads (NOT error message, NOT alert)

**15. Verify Step 4 Path A content:**
- Header: "Step 4 of 7" / "The Macro-Pain Frame"
- Script should start with:
  ```
  "Perfect. That's a very common platform, and it handles basic compliance well. 
   But the reason we built Orcanos is to address two massive headaches I see 
   across the medical device space: the isolation trap and the customization tax."
  ```
- Should mention:
  - "Engineers are still stuck using Excel for BOM tracking"
  - "SharePoint for DHFiles"
  - "Legacy systems lock you in"
  - "Customization fees"
- Delivery Tip should be prominent in amber box above script

---

### **Phase 6: Continue to Step 5, 6, 7**

**16. Click "Next Step →" (Step 4 → Step 5)**
- Title: "The Consultative Pause"
- Script: "Do you mind if I share a quick, real-world story of how a peer company handled this exact transition?"
- Timer: "5–10s"

**17. Click "Next Step →" (Step 5 → Step 6)**
- Title: "The Proof"
- Script should include Covaris case study:
  - "500 sellable products"
  - "8,000 active parts"
  - "10,000 controlled documents"
  - "5,000 manual training events a year"
  - "4 full-time positions worth of administrative waste"
  - "4 FDA audits in 10 days with zero back-room prep"

**18. Click "Next Step →" (Step 6 → Step 7)**
- Title: "The Final Soft Hook"
- Script should include:
  - "15-minute introductory conversation next week"
  - "How does your calendar look next Tuesday or Thursday?"

---

### **Phase 7: End Call & Post-Call Capture**

**19. Click "End Call" button (on Step 7)**
- Expected: Navigate to post-call capture form
- Evidence: Form with fields for outcome, notes, etc.

**20. Fill in post-call form:**
- Outcome: Select one (e.g., "follow_up")
- Notes: "Good initial call, mentioned budget concerns"
- Click "Save Call"
- Expected: Call saved to database
- Evidence: Redirect to dashboard or home page

---

## Resistance Handlers Test (Optional)

**21. Start another call, get to any step**
- Click 🛡️ button (Resistance Handlers icon)
- Expected: Drawer opens showing 3 objections:
  1. "Too busy / Middle of a major project"
  2. "We already spent a lot of money on our current system"
  3. "We don't have the budget for a new platform right now"
- Evidence: Each has title and full response text from PDF

**22. Click one to expand it**
- Expected: Response text displays (should be long, detailed, from PDF)
- Evidence: Text includes Covaris reference, specific metrics

---

## Dashboard Test (Optional)

**23. Click "Dashboard" or similar link**
- Expected: Dashboard shows call metrics
- Evidence: Shows the call you just created with:
  - Prospect name: "John Doe"
  - Company: "Acme Medical Devices"
  - Date: Today
  - Duration: Shows seconds
  - Outcome: What you selected

---

## Success Criteria

✅ **All tests pass if:**

1. ✅ "Step X of 7" displays (not "of 8")
2. ✅ Home page has prospect name & company name fields
3. ✅ All 7 step scripts match PDF text exactly
4. ✅ Delivery tips appear in prominent amber boxes
5. ✅ System name field is optional on branching screen
6. ✅ Step 4 Path A content talks about "isolation trap" and "customization tax"
7. ✅ Step 6 includes Covaris metrics (500 products, 8,000 parts, etc.)
8. ✅ All 3 resistance handlers display correctly
9. ✅ Post-call form saves prospect name and company to database

---

## Known Issues to Watch For

- ⚠️ If system name is required and shows error → Need to re-check BranchingScreen.jsx
- ⚠️ If scripts show old generic text → Database might not have updated correctly
- ⚠️ If "Step X of 8" displays → CallScreen.jsx didn't update properly
- ⚠️ If delivery tips are missing or hard to see → ScriptDisplay.jsx styling issue

---

## Browser DevTools Tips

**To debug while testing:**

1. **Open browser DevTools** (F12)
2. **Console tab:** Look for any JavaScript errors (red X)
3. **Network tab:** Check Supabase requests are successful (200 status)
4. **Application/Storage tab:** Verify auth token is present

---

## If Issues Arise

1. **Check browser console for errors** (F12 → Console)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Verify Supabase connection:** Check .env file has correct credentials
4. **Restart dev server:** Kill server and run `npm run dev` again
5. **Check database manually in Supabase:**
   ```sql
   SELECT COUNT(*) as script_count FROM call_scripts;
   -- Should return: 7
   
   SELECT COUNT(*) as handler_count FROM resistance_handlers;
   -- Should return: 3
   ```

---

## Demo Talking Points

**When demonstrating to stakeholders:**

1. "This is the founder cold call script from the PDF, integrated into the app"
2. "Notice the 7-step flow with delivery tips for each step"
3. "The script branches at Step 4 based on whether they named a specific system"
4. "If they named a system like TrackWise, we give them the 'isolation trap' angle"
5. "If they use spreadsheets, we give them the 'bypass fragmentation' angle"
6. "The Covaris case study in Step 6 shows real metrics: 500 products, 8,000 parts"
7. "We capture prospect name and company at the start for better call tracking"
8. "System name is optional because not all prospects will name a specific system"

