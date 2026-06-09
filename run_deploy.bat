@echo off
REM Deployment script
REM Generated: 2026-06-09T21:42:35.366Z

echo Building for production...
npm run build

if %ERRORLEVEL% NEQ 0 (
  echo Build failed!
  exit /b 1
)

echo.
echo ✓ Build complete! Ready for deployment.
echo.
