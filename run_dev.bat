@echo off
REM Development environment startup script
REM Generated: 2026-06-09T21:42:35.363Z

echo Starting development environment...

REM Kill any existing Node processes
taskkill /F /IM node.exe 2>nul

REM Create .env from .env.example if it doesn't exist
if not exist .env (
  echo Creating .env file...
  copy .env.example .env
  echo Please update .env with your configuration
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
  echo Installing dependencies...
  npm install
)

REM Start backend
echo Starting backend...
start "Backend" npm run dev

REM Wait for backend to start
timeout /t 3 /nobreak

REM Open browser
echo Opening browser...
timeout /t 2 /nobreak
start http://localhost:3000

echo.
echo ✓ Development environment started!
echo.
echo Press Ctrl+C in this window to stop, or close the backend window.
echo.
