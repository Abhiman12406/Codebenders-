import React, { useState } from 'react';
import { X, Cloud, Terminal } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

export default function AuthModal({ isOpen, onClose, onAuthChanged, onResetDemo }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const configured = Boolean(supabase) && isSupabaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (data?.session) {
          onAuthChanged?.();
        } else {
          setMessage('ACCOUNT CREATED. CHECK YOUR EMAIL TO CONFIRM, THEN LOG IN.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onAuthChanged?.();
      }
    } catch (err) {
      setError(err?.message || 'AUTHENTICATION FAILED.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#0a0a0a] border border-[#3a3a3f] rounded-[8px] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3a3a3f] bg-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#0a0a0a] border border-[#3a3a3f] flex items-center justify-center text-white">
              <Cloud className="w-4 h-4" />
            </div>
            <span className="button-cap text-white text-base">SUPABASE CLOUD SYNC</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[4px] border border-[#3a3a3f] text-[#5a5a5f] hover:text-white hover:border-white transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-6 text-xs">
          {!configured ? (
            <div className="bg-black border border-[#3a3a3f] rounded-[4px] p-4 text-[#f0f0fa] leading-relaxed micro-cap">
              Supabase cloud credentials are not configured. The app is currently operating with local browser storage.
            </div>
          ) : (
            <>
              {/* Login / Signup toggle */}
              <div className="grid grid-cols-2 bg-black border border-[#3a3a3f] rounded-[32px] p-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                  className={`py-2 rounded-[32px] font-bold uppercase tracking-[1.17px] transition ${mode === 'login' ? 'bg-white text-black' : 'text-[#5a5a5f] hover:text-white'}`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                  className={`py-2 rounded-[32px] font-bold uppercase tracking-[1.17px] transition ${mode === 'signup' ? 'bg-white text-black' : 'text-[#5a5a5f] hover:text-white'}`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="name@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-input text-xs tracking-[0.96px]"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-input text-xs tracking-[0.96px]"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="button-ghost-on-dark w-full text-xs py-3 disabled:opacity-50"
                >
                  {busy ? 'Authenticating...' : mode === 'signup' ? 'Create Cloud Account' : 'Log In to Account'}
                </button>
              </form>

              {error && (
                <p className="bg-black border border-[#ef4444] rounded-[4px] p-3 text-[#ef4444] micro-cap font-bold">
                  {error}
                </p>
              )}
              {message && (
                <p className="bg-black border border-white rounded-[4px] p-3 text-white micro-cap font-bold">
                  {message}
                </p>
              )}
            </>
          )}

          {/* Guest / Demo reset */}
          <div className="border-t border-[#3a3a3f] pt-5 space-y-3">
            <p className="micro-cap text-[#5a5a5f]">
              LOCAL STORAGE SANDBOX
            </p>
            <button
              type="button"
              onClick={() => onResetDemo?.()}
              className="button-ghost-sm w-full text-xs py-2.5 px-4 flex items-center justify-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5 text-white" />
              <span>Continue as Guest / Reset Demo Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
