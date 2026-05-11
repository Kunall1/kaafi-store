// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
// Wraps the entire app and provides:
//   - user       : the logged-in Supabase user object (null if logged out)
//   - loading    : true while we're checking the initial session
//   - signIn()   : sign in with email + password
//   - signUp()   : create account with email + password + name
//   - signOut()  : log the user out
//
// Usage anywhere in the app:
//   import { useAuth } from '../context/AuthContext';
//   const { user, signIn, signOut } = useAuth();

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);   // true until first session check

  useEffect(() => {
    // 1. Get the session that may already exist (e.g. after a page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Subscribe to future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Cleanup listener on unmount
    return () => subscription.unsubscribe();
  }, []);

  // ── Sign up ────────────────────────────────────────────────────────────────
  // Creates a new account. Supabase sends a confirmation email by default —
  // you can disable that in Supabase Dashboard → Auth → Email confirmations.
  const signUp = async ({ email, password, name }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },   // stored in auth.users → raw_user_meta_data
      },
    });
    if (error) throw error;
    return data;
  };

  // ── Sign in ────────────────────────────────────────────────────────────────
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook — use this instead of useContext(AuthContext) directly
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
