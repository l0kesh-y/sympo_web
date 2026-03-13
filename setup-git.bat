@echo off
REM Quick Git Setup for Render Deployment (Windows)
REM This script initializes Git and prepares your repository

echo 🚀 Setting up Git for Render Deployment
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git is not installed. Please install Git first:
    echo    Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git found!
echo.

REM Check if already a Git repo
if exist ".git" (
    echo ℹ️  Git repository already initialized
) else (
    echo 📦 Initializing Git repository...
    git init
    echo ✅ Git initialized!
    echo.
)

REM Add all files
echo 📝 Adding files to Git...
git add .
echo ✅ Files added!
echo.

REM Check for .env file
if exist ".env" (
    echo ⚠️  WARNING: .env file detected!
    echo    This file contains secrets and should NOT be committed.
    echo    Make sure .gitignore includes '.env'
    echo.
)

REM Create initial commit
echo 📦 Creating initial commit...
git commit -m "Initial commit - Ready for Render deployment"
echo ✅ Commit created!
echo.

REM Set default branch to main
echo 🔧 Setting default branch to 'main'...
git branch -M main
echo ✅ Branch set to 'main'!
echo.

echo ===================================
echo ✨ Git Setup Complete!
echo ===================================
echo.
echo Next steps:
echo 1. Create a repository on GitHub/GitLab
echo 2. Run these commands (replace with your repo URL):
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/bid2code.git
echo    git push -u origin main
echo.
echo 3. Then deploy on Render!
echo.
echo 📖 For detailed deployment guide, see:
echo    - QUICK_DEPLOY.md
echo    - DEPLOYMENT_GUIDE.md
echo.
pause
