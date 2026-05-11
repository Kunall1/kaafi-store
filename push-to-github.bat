@echo off
echo.
echo  =============================================
echo   KAAFI — Push to GitHub
echo  =============================================
echo.

cd /d "%~dp0"

echo [1/4] Staging all changes...
git add .
git status

echo.
echo [2/4] Committing...
git commit -m "feat(auth): Phase 2 — Supabase auth integration

- Add @supabase/supabase-js dependency
- Create src/lib/supabase.js — Supabase client
- Create src/context/AuthContext.jsx — auth state (signIn/signUp/signOut)
- Create src/components/AuthModal.jsx — KAAFI-styled login/signup modal
- Update src/main.jsx — wrap app with AuthProvider
- Update src/App.jsx — user icon in Nav, protected checkout, auth modal
- Create supabase/schema.sql — full DB schema with RLS + seed data"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo  =============================================
echo   Done! Phase 2 is live at:
echo   https://github.com/Kunall1/kaafi-store
echo  =============================================
echo.
echo  NEXT: Run the Supabase schema
echo  1. Go to https://supabase.com/dashboard
echo  2. Open kaafi-store project
echo  3. SQL Editor ^> New Query
echo  4. Paste contents of supabase/schema.sql
echo  5. Click Run
echo.
echo  ALSO: Run npm install in this folder to fix local node_modules:
echo  Open a terminal here and run: npm install
echo.
pause
