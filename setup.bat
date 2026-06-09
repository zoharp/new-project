@echo off
setlocal enabledelayedexpansion

title Orcanos Performance Tool - Setup

echo.
echo ============================================================
echo  Orcanos Performance Testing Tool - Setup Wizard
echo ============================================================
echo.

REM Check if .env exists
if not exist .env (
    echo [1/5] Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env file and fill in:
    echo   - ADMIN_PASSWORD: Your secure admin password
    echo   - ENCRYPTION_KEY: Generate with: python -c "from secrets import token_hex; print(token_hex(16))"
    echo.
    pause
) else (
    echo [1/5] .env file already exists
)

REM Check Python venv
if not exist .venv (
    echo.
    echo [2/5] Creating Python virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✓ Virtual environment created
) else (
    echo.
    echo [2/5] Python virtual environment already exists
)

REM Install Python dependencies
echo.
echo [3/5] Installing Python dependencies...
call .venv\Scripts\activate
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✓ Python dependencies installed

REM Install Playwright browsers
echo.
echo [4/5] Installing Playwright browsers (required for scenario recording)...
playwright install --with-deps chromium
if errorlevel 1 (
    echo WARNING: Playwright browser installation may have failed
    echo Try running: playwright install
)
echo ✓ Playwright setup complete

REM Install frontend dependencies
echo.
echo [5/5] Installing frontend dependencies...
cd frontend
call npm install --silent
cd ..
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed

REM Prompt to generate accounts.json
echo.
echo ============================================================
echo Setup complete! Next steps:
echo ============================================================
echo.
echo 1. ENCRYPT ACCOUNT PASSWORDS:
echo    python scripts/import_accounts.py
echo.
echo 2. RECORD FIRST SCENARIO:
echo    python scripts/record_scenario.py "basic_workflow" "https://app.orcanos.com/orcanos/web/"
echo.
echo 3. START FULL STACK:
echo    run.bat
echo.
echo 4. OPEN IN BROWSER:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8000/docs
echo.
echo For detailed instructions, see: RECORDING_GUIDE.md
echo ============================================================
echo.

pause
