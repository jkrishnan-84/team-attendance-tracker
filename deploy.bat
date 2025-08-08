@echo off
echo 🚀 Deploying Team Attendance Tracker to GitHub Pages
echo ==================================================

REM Check if git is initialized
if not exist ".git" (
    echo ❌ This is not a git repository. Please follow the setup guide first.
    pause
    exit /b 1
)

REM Add all changes
echo 📁 Adding files...
git add .

REM Get commit message from user or use default
if "%~1"=="" (
    set "COMMIT_MSG=Update attendance tracker - %date% %time%"
) else (
    set "COMMIT_MSG=%~1"
)

REM Commit changes
echo 💾 Committing changes: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

REM Push to GitHub
echo 🌐 Pushing to GitHub...
git push origin main

echo ✅ Deployment complete!
echo 📱 Check your GitHub repository settings to get your live URL
echo ⏰ Changes may take 1-2 minutes to appear online.
echo.
pause
