@echo off
echo.
echo  =============================================
echo   KAAFI — Git Setup and Push to GitHub
echo  =============================================
echo.

cd /d "%~dp0"

echo [1/5] Removing any broken git state...
if exist ".git" rmdir /s /q ".git"

echo [2/5] Initialising git repo...
git init
git branch -M main

echo [3/5] Setting remote origin...
git remote add origin https://github.com/Kunall1/kaafi-store.git

echo [4/5] Staging all files...
git add .
git status

echo [5/5] Committing and pushing...
git commit -m "feat: initial KAAFI frontend — Vite + React scaffold"
git push -u origin main --force

echo.
echo  =============================================
echo   Done! Check https://github.com/Kunall1/kaafi-store
echo  =============================================
echo.
pause
