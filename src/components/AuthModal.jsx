// ─── AUTH MODAL ──────────────────────────────────────────────────────────────
// A KAAFI-styled dark modal for login and signup.
// Handles its own form state, error display, and loading.
//
// Props:
//   onClose()     — called when the user dismisses the modal
//   onSuccess()   — called after a successful login or signup
//   initialMode   — "login" (default) | "signup"

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const HD   = { fontFamily: "'Uncial Antiqua', cursive", fontWeight: 400 };
const LOGO = { fontFamily: "'Anton', sans-serif", fontWeight: 400 };

// Reusable input style matching the rest of the site (defined in index.css via className)
const inp = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
};

export default function AuthModal({ onClose, onSuccess, initialMode = 'login' }) {
  const [mode, setMode]   = useState(initialMode);  // 'login' | 'signup'
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const { signIn, signUp } = useAuth();

  const hc = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const switchMode = newMode => {
    setMode(newMode);
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  const submit = async () => {
    setError('');

    // Basic validation
    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'signup' && !form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn({ email: form.email.trim(), password: form.password });
      } else {
        await signUp({
          email:    form.email.trim(),
          password: form.password,
          name:     form.name.trim(),
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      // Make Supabase error messages more readable
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password.');
      } else if (msg.includes('User already registered')) {
        setError('An account with this email already exists. Sign in instead.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Please confirm your email first. Check your inbox.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleKey = e => { if (e.key === 'Enter') submit(); };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.88)',
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* ── Modal panel ── */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(420px, 92vw)',
        background: '#0a0a0a',
        border: '1px solid #1e1e1e',
        padding: '40px 36px 32px',
        zIndex: 1001,
        animation: 'fadeIn 0.2s ease',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: 32,
        }}>
          <div>
            <span style={{ ...LOGO, fontSize: 13, letterSpacing: '0.18em', color: '#444' }}>
              KAAFI
            </span>
            <h2 style={{ ...HD, fontSize: 24, letterSpacing: '0.02em', marginTop: 6 }}>
              {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#555', fontSize: 20, lineHeight: 1, padding: 4,
            }}
            aria-label="Close"
          >✕</button>
        </div>

        {/* Form */}
        {mode === 'signup' && (
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={hc('name')}
            onKeyDown={handleKey}
            style={{ ...inp, marginBottom: 8 }}
            autoFocus
          />
        )}

        <input
          placeholder="Email address"
          type="email"
          value={form.email}
          onChange={hc('email')}
          onKeyDown={handleKey}
          style={{ ...inp, marginBottom: 8 }}
          autoFocus={mode === 'login'}
        />

        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={hc('password')}
          onKeyDown={handleKey}
          style={{ ...inp, marginBottom: error ? 12 : 20 }}
        />

        {/* Error message */}
        {error && (
          <p style={{
            fontSize: 11, color: '#e05252', marginBottom: 14,
            letterSpacing: '0.01em', lineHeight: 1.5,
          }}>
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          onClick={submit}
          disabled={busy}
          style={{
            width: '100%', padding: '17px',
            background: busy ? '#1a1a1a' : '#fff',
            color: busy ? '#555' : '#000',
            border: 'none', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            cursor: busy ? 'not-allowed' : 'pointer',
            fontFamily: "'Uncial Antiqua', cursive",
            marginBottom: 20,
            transition: 'all 0.2s ease',
          }}
        >
          {busy
            ? (mode === 'login' ? 'SIGNING IN...' : 'CREATING ACCOUNT...')
            : (mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT')
          }
        </button>

        {/* Toggle login / signup */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#555' }}>
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '
          }
          <span
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            style={{
              color: '#fff', cursor: 'pointer',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </span>
        </p>

        {/* Legal note on signup */}
        {mode === 'signup' && (
          <p style={{
            fontSize: 9, color: '#333', textAlign: 'center',
            marginTop: 18, lineHeight: 1.7, letterSpacing: '0.02em',
          }}>
            By creating an account you agree to KAAFI&apos;s privacy policy.<br />
            Your details are used only for order fulfilment.
          </p>
        )}
      </div>
    </>
  );
}
