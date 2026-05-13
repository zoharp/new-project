# Scenario Recording Guide

## Overview

This guide explains how to record your first test scenario using Playwright.

---

## Prerequisites

1. **Environment Setup** (one-time)
   ```bash
   # Create .env file
   cp .env.example .env
   # Edit .env and fill in:
   #   ADMIN_PASSWORD=your-secure-password
   #   ENCRYPTION_KEY=your-32-char-hex-key (generate with: python -c "from secrets import token_hex; print(token_hex(16))")
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   cd frontend && npm install && cd ..
   ```

3. **Initialize Accounts**
   ```bash
   python scripts/import_accounts.py
   ```
   This will:
   - Read account details (url + password)
   - Encrypt passwords using your ENCRYPTION_KEY
   - Generate `accounts.json` with encrypted data

---

## Recording Your First Scenario

### Step 1: Start the Playwright Recorder

```bash
python scripts/record_scenario.py "basic_login_workflow" "https://app.orcanos.com/orcanos/web/"
```

**Arguments:**
- `scenario_name`: Name for your scenario (e.g., "basic_login_workflow")
- `base_url`: Starting URL (will open in browser)

### Step 2: Interact in the Browser

A browser window will open. Perform the exact steps you want to test:

```
Examples of commands:
  click button[type="submit"]     - Click the login button
  type input[name="Email"] | orcanos.tech   - Type email
  type input[name="Password"] | YOUR_PASSWORD - Type password
  wait .dashboard                 - Wait for dashboard to load
  screenshot                      - Capture current state
  url                            - See current URL
  list                           - List recorded steps
  stop                           - Save and exit
```

### Step 3: Execute Interactions

1. **Login Step:**
   ```
   >> navigate https://app.orcanos.com/orcanos/web/Account/Login
   >> type input[name="Email"] | orcanos.tech
   >> type input[name="Password"] | OrcSupport_orcanos_3014!
   >> click button[type="submit"]
   >> wait .dashboard
   ```

2. **Dashboard Navigation:**
   ```
   >> wait h1
   >> screenshot
   >> list
   ```

3. **Save Scenario:**
   ```
   >> stop
   ```

The scenario will be saved to: `backend/scenarios/basic_login_workflow.json`

---

## Scenario JSON Format

After recording, your scenario will look like:

```json
{
  "name": "basic_login_workflow",
  "base_url": "https://app.orcanos.com/orcanos/web/",
  "user": "orcanos.tech",
  "created_at": "2024-05-13T10:30:00.123456",
  "steps": [
    {
      "name": "Navigate to login",
      "action": "navigate",
      "target": "https://app.orcanos.com/orcanos/web/Account/Login",
      "value": null,
      "expected_result": "Login page loaded"
    },
    {
      "name": "Type in input[name='Email']",
      "action": "type",
      "target": "input[name='Email']",
      "value": "orcanos.tech",
      "expected_result": null
    },
    {
      "name": "Type in input[name='Password']",
      "action": "type",
      "target": "input[name='Password']",
      "value": "PASSWORD",
      "expected_result": null
    },
    {
      "name": "Click button[type='submit']",
      "action": "click",
      "target": "button[type='submit']",
      "value": null,
      "expected_result": "Logged in, dashboard displayed"
    }
  ]
}
```

---

## Available Recorder Commands

| Command | Usage | Example |
|---------|-------|---------|
| `navigate <url>` | Go to a URL | `navigate https://example.com` |
| `click <selector>` | Click element | `click button[type="submit"]` |
| `type <sel> \| <text>` | Type into input | `type input[name="email"] \| user@example.com` |
| `wait <selector>` | Wait for element | `wait .dashboard` |
| `screenshot` | Take screenshot | `screenshot` |
| `url` | Print current URL | `url` |
| `list` | Show recorded steps | `list` |
| `help` | Show all commands | `help` |
| `stop` | Save & exit | `stop` |

---

## Manual Scenario Creation

If you prefer not to use the interactive recorder, you can manually create a scenario JSON:

```json
{
  "name": "my_scenario",
  "base_url": "https://app.orcanos.com/orcanos/web/",
  "user": "orcanos.tech",
  "steps": [
    {
      "name": "Step description",
      "action": "click|type|navigate|wait",
      "target": "CSS selector or URL",
      "value": "Text for type actions",
      "expected_result": "What should happen"
    }
  ]
}
```

Save this as: `backend/scenarios/my_scenario.json`

---

## Testing Your Scenario

Once recorded, the scenario will be:
1. Loaded by the test runner
2. Executed against all accounts in `accounts.json`
3. Timing recorded for each step
4. Results stored in SQLite database
5. Displayed in the Results dashboard

---

## Troubleshooting

**Browser doesn't open:**
- Ensure Playwright browsers are installed: `playwright install`

**Selectors not found:**
- Use browser DevTools (F12) to find correct CSS selectors
- Try more specific selectors (e.g., `button[data-action="submit"]`)

**Timeout errors:**
- Increase wait time: `wait selector` (default 5000ms)
- Check if element is actually present

**Password issues:**
- Ensure correct account password in `accounts.json` (use `scripts/import_accounts.py`)
- Verify user credentials in scenario match account config

---

## Next Steps

1. Record your first scenario
2. Verify scenario file is created in `backend/scenarios/`
3. Implement test runner to execute scenario against accounts
4. View results in dashboard

Happy testing! 🚀
