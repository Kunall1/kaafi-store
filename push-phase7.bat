@echo off
echo Pushing Phase 7 - Jakarta Sans Redesign...
cd /d "C:\Users\Kunal\Desktop\kaafi"
git add .
git commit -m "Phase 7: Plus Jakarta Sans typography redesign

- Replaced Cormorant Garamond + Inter with Plus Jakarta Sans
- Headlines: 800 weight, uppercase, tight letter-spacing
- Light italic spans for contrast (200 weight)
- Hero restructured: massive wordmark + tagline/CTA bottom row
- Marquee: bold 700 uppercase
- Product cards, page headers, cart, checkout all updated
- All payment/auth/admin logic unchanged"
git push origin main
echo.
echo Phase 7 pushed! Live on Vercel in ~1 min.
pause
