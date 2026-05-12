@echo off
echo Pushing Phase 5 - Editorial Redesign + Size Chart Update...
cd /d "C:\Users\Kunal\Desktop\kaafi"
git add .
git commit -m "Phase 5: Editorial redesign + size chart update

- Complete frontend redesign: Cormorant Garamond + Inter typography
- Cream/off-white palette (#F7F4EF bg, #0f0f0f ink, #DDD8D0 borders)
- Editorial grid layout, minimal product cards with hover quick-add
- SIZE_CHART updated: S/M/L actual measurements (Length, Chest, Sleeve)
- Note: Sizes in inches, allow plus/minus 0.5 inch variation
- All Phase 4 Razorpay payment logic preserved"
git push origin main
echo.
echo Phase 5 pushed! Check Vercel for live preview.
pause
