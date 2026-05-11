@echo off
echo.
echo  =============================================
echo   KAAFI — Push to GitHub
echo  =============================================
echo.

cd /d "%~dp0"

echo [1/3] Staging all changes...
git add .
git status

echo.
echo [2/3] Committing...
git commit -m "feat(products): Phase 3 — Supabase-driven product catalogue

- Add src/hooks/useProducts.js — fetches active products from DB
- Replace hardcoded PRODUCTS array with live Supabase data
- Add ProductSkeleton component for loading state
- Add shimmer animation to index.css
- Pass products down to ProductGrid, Shop, Product pages
- Fallback to hardcoded data if Supabase is unreachable"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo  =============================================
echo   Done! Phase 3 is live.
echo   Products now load from your Supabase DB.
echo  =============================================
echo.
pause
