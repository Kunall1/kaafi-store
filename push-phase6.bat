@echo off
echo Pushing Phase 6 - Admin Dashboard...
cd /d "C:\Users\Kunal\Desktop\kaafi"
git add .
git commit -m "Phase 6: Admin dashboard

- AdminDashboard component (orders + inventory tabs)
- Stats row: total orders, revenue, shipped, delivered
- Orders tab: all orders, customer info, status dropdown (paid/shipped/delivered/cancelled)
- Inventory tab: stock per product/size, editable inline, sold-out warning
- Admin nav link in user menu (admin email only)
- supabase/admin-policies.sql: RLS policies for admin read/write access
- Admin email guard: ADMIN_EMAIL constant, frontend + Supabase RLS double protection"
git push origin main
echo.
echo Phase 6 pushed!
echo.
echo NEXT STEP — Run admin-policies.sql in Supabase:
echo   1. Go to supabase.com - your project - SQL Editor
echo   2. Open New Query
echo   3. Paste contents of supabase/admin-policies.sql
echo   4. Click Run
echo.
pause
