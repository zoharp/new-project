# Orcanos Performance Tool — Quick Start Guide

## ✅ What's Ready

- ✅ Full backend structure (FastAPI + SQLAlchemy + SQLite)
- ✅ Full frontend structure (React + Vite)
- ✅ Playwright scenario recording system
- ✅ Account management with password encryption
- ✅ Automated setup wizard
- ✅ API routes (auth, accounts, runs, results)
- ✅ Database models (accounts, scenarios, test runs, step results)

---

## 🚀 Getting Started (5 Steps)

### Step 1: Automated Setup (1 minute)
```bash
setup.bat
```

This will:
- ✓ Create Python virtual environment
- ✓ Install Python dependencies (FastAPI, SQLAlchemy, Playwright, etc.)
- ✓ Install Playwright browsers
- ✓ Install frontend dependencies (React, Vite, Recharts)

**Action:** Let setup.bat run to completion, then press any key.

---

### Step 2: Configure Environment (2 minutes)

Open `.env` file and fill in:

```bash
# Generate a secure encryption key:
python -c "from secrets import token_hex; print(token_hex(16))"

# Then edit .env:
ADMIN_PASSWORD=YourSecurePassword123!
ENCRYPTION_KEY=<paste-the-32-char-hex-from-above>
ENVIRONMENT=development
DATABASE_URL=sqlite:///./orcanos_performance.db
```

---

### Step 3: Create Encrypted accounts.json (1 minute)

```bash
python scripts/import_accounts.py
```

**Output:**
```
✓ Added account: orcanos
✓ Generated accounts.json
✓ Total accounts: 1
```

This creates `accounts.json` with:
- Account: `orcanos`
- URL: `https://app.orcanos.com/orcanos/web/`
- Password: `OrcSupport_orcanos_3014!` (encrypted)
- Shared user: `orcanos.tech`

---

### Step 4: Record Your First Scenario (5 minutes)

```bash
python scripts/record_scenario.py "basic_login_workflow" "https://app.orcanos.com/orcanos/web/"
```

**Browser will open. In the console, enter:**

```
>> type input[name="Email"] | orcanos.tech
>> type input[name="Password"] | OrcSupport_orcanos_3014!
>> click button[type="submit"]
>> wait .dashboard
>> screenshot
>> stop
```

**Output:**
```
✓ Scenario saved to: backend/scenarios/basic_login_workflow.json
```

---

### Step 5: Start the App (1 minute)

```bash
run.bat
```

This opens:
- **Frontend:** http://localhost:5173 (React app)
- **Backend:** http://localhost:8000 (FastAPI)
- **API Docs:** http://localhost:8000/docs (Swagger UI)

---

## 📂 Project Structure

```
orcanos-performance/
├── setup.bat                      ← Run this first (automated setup)
├── run.bat                        ← Start full stack
├── QUICKSTART.md                  ← This file
├── RECORDING_GUIDE.md             ← Detailed recording instructions
├── accounts.json                  ← Test accounts (auto-generated)
├── .env                           ← Environment variables (create from .env.example)
├── requirements.txt               ← Python dependencies
│
├── backend/
│   ├── api.py                     ← FastAPI app (port 8000)
│   ├── models.py                  ← Database models
│   ├── services/
│   │   ├── database.py            ← SQLite connections
│   │   ├── encryption.py          ← AES-256 password encryption
│   │   ├── auth.py                ← JWT authentication
│   │   └── scenario_recorder.py   ← Scenario recording
│   └── routes/
│       ├── auth.py                ← /api/auth/login, /logout, /verify
│       ├── accounts.py            ← /api/accounts (CRUD)
│       ├── runs.py                ← /api/runs (test execution)
│       └── results.py             ← /api/results (step results)
│
├── frontend/
│   ├── package.json               ← React dependencies
│   ├── vite.config.js             ← Vite config
│   ├── index.html                 ← Root HTML
│   └── src/
│       ├── main.jsx               ← React entry point
│       ├── App.jsx                ← App component
│       └── App.css                ← Styling
│
├── scripts/
│   ├── setup.bat                  ← Automated setup
│   ├── import_accounts.py         ← Encrypt passwords & generate accounts.json
│   ├── record_scenario.py         ← Interactive Playwright scenario recorder
│   └── encrypt_password.py        ← Utility for single password encryption
│
└── backend/scenarios/             ← Recorded scenarios (JSON files)
    └── basic_login_workflow.json  ← Your first scenario (created by recorder)
```

---

## 🎯 Accounts & User Model

**Shared User (for all test runs):**
- Username: `orcanos.tech`
- This user is used to perform all test scenarios across accounts

**Test Accounts (from accounts.json):**
```json
{
  "accounts": [
    {
      "name": "orcanos",
      "url": "https://app.orcanos.com/orcanos/web/",
      "password": "[ENCRYPTED]",
      "enabled": true
    }
  ],
  "user": "orcanos.tech",
  "thresholds": {
    "warning": 3,
    "critical": 10
  }
}
```

Each account can have a different password, but all use the same `orcanos.tech` user to run tests.

---

## 📊 Test Scenario Format

After recording, scenarios are stored as JSON:

```json
{
  "name": "basic_login_workflow",
  "base_url": "https://app.orcanos.com/orcanos/web/",
  "user": "orcanos.tech",
  "steps": [
    {
      "name": "Type email",
      "action": "type",
      "target": "input[name='Email']",
      "value": "orcanos.tech",
      "expected_result": "Email entered"
    },
    {
      "name": "Click login",
      "action": "click",
      "target": "button[type='submit']",
      "expected_result": "Logged in, dashboard displayed"
    }
  ]
}
```

**Actions:**
- `navigate` — Go to URL
- `click` — Click element
- `type` — Type into input
- `wait` — Wait for element
- `screenshot` — Capture screen

---

## 🔧 Available Commands

```bash
# Setup (first time only)
setup.bat

# Encrypt accounts and generate accounts.json
python scripts/import_accounts.py

# Record a new scenario (interactive)
python scripts/record_scenario.py "scenario_name" "base_url"

# Encrypt single password (utility)
python scripts/encrypt_password.py "password"

# Start full stack (backend + frontend)
run.bat

# Start backend only
run-backend.bat

# Commit & push to GitHub (triggers Vercel deploy)
GitPush.bat
```

---

## 🧪 Testing the Setup

### Test Backend Health
```bash
curl http://localhost:8000/health
# Response: {"status":"ok","backend_version":"0.1.0"}
```

### Test API Docs
- Open http://localhost:8000/docs in browser
- Try the endpoints interactively

### Test Frontend
- Open http://localhost:5173 in browser
- Should show "Backend connected successfully!"

---

## 📋 Next Development Phases

### Phase 1: Core Functionality
- [ ] Wire up accounts.json loader in backend
- [ ] Implement test runner (execute scenario against accounts)
- [ ] Store results in SQLite
- [ ] Display results in dashboard

### Phase 2: Frontend
- [ ] Login page (admin authentication)
- [ ] Dashboard (account list + status)
- [ ] Results dashboard (tables + charts)
- [ ] History view

### Phase 3: Advanced Features
- [ ] Scheduled test runs (APScheduler)
- [ ] Email/Slack notifications
- [ ] Historical trends (Recharts)
- [ ] Multiple scenarios

### Phase 4: Deployment
- [ ] Vercel deployment
- [ ] CI/CD setup
- [ ] Production database (PostgreSQL)
- [ ] Monitoring & logging

---

## 🆘 Troubleshooting

**Q: Browser doesn't open in scenario recorder?**
```bash
# Install Playwright browsers:
playwright install --with-deps chromium
```

**Q: Python venv not activating?**
```bash
# Create it manually:
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux
```

**Q: Port 8000 already in use?**
```bash
# Find and kill process:
netstat -ano | findstr :8000
taskkill /PID <pid> /F
```

**Q: Need to generate new ENCRYPTION_KEY?**
```bash
python -c "from secrets import token_hex; print(token_hex(16))"
```

---

## 📞 Quick Reference

| Action | Command |
|--------|---------|
| First-time setup | `setup.bat` |
| Generate accounts | `python scripts/import_accounts.py` |
| Record scenario | `python scripts/record_scenario.py "name" "url"` |
| Start app | `run.bat` |
| API Docs | http://localhost:8000/docs |
| Frontend | http://localhost:5173 |
| Backend health | http://localhost:8000/health |

---

## ✨ You're All Set!

Everything is ready to go. Just follow the 5 steps above and you'll have:
1. ✅ Running backend (FastAPI on 8000)
2. ✅ Running frontend (React on 5173)
3. ✅ Encrypted accounts
4. ✅ Recorded first scenario
5. ✅ Ready for test execution

**Questions?** See `RECORDING_GUIDE.md` for detailed instructions.

Happy testing! 🚀
