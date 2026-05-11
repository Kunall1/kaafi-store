// ─── SUPABASE CLIENT ─────────────────────────────────────────────────────────
// This is the single Supabase client used across the entire app.
// Import this wherever you need to talk to the database or auth.
//
// Usage:
//   import { supabase } from '../lib/supabase';
//   const { data, error } = await supabase.from('products').select('*');

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase env vars. ' +
    'Create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Keep the user logged in across page refreshes using localStorage
    persistSession: true,
    autoRefreshToken: true,
  },
});
