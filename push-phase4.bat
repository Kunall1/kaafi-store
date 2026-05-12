@echo off
echo Pushing Phase 4 - Razorpay Payment Integration...
cd /d "C:\Users\Kunal\Desktop\kaafi"
git add .
git commit -m "Phase 4: Razorpay payment integration

- api/create-order.js: Vercel serverless function creates Razorpay order
- api/verify-payment.js: Verifies HMAC signature + sends confirmation email
- App.jsx: Real Razorpay checkout replaces mock setTimeout flow
- App.jsx: Orders page shows full order history from Supabase
- vercel.json: API routes excluded from SPA rewrite
- .env.local: Razorpay test keys wired up"
git push origin main
echo.
echo Phase 4 pushed! Go to Vercel dashboard to add env vars.
pause
