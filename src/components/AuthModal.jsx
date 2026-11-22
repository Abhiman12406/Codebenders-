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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#1C1C1F] border border-[#2E2E35] rounded-[28px] overflow-hidden text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A32] bg-[#161619]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[14px] bg-[#675DFC]/10 border border-[#675DFC]/30 flex items-center justify-center text-[#8B82FF]">
              <Cloud className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">Supabase Cloud Sync</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#A1A1AA] hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-6 text-xs">
          {!configured ? (
            <div className="bg-[#141417] border border-[#27272F] rounded-[16px] p-4 text-[#A1A1AA] leading-relaxed text-xs">
              Supabase cloud credentials are not configured. The app is currently operating with local offline browser storage.
            </div>
          ) : (
            <>
              {/* Login / Signup toggle */}
              <div className="grid grid-cols-2 bg-[#141417] border border-[#2E2E38] rounded-full p-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                  className={`py-2 rounded-full font-bold text-xs uppercase tracking-wide transition ${mode === 'login' ? 'bg-[#675DFC] text-white shadow-sm' : 'text-[#A1A1AA] hover:text-white'}`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                  className={`py-2 rounded-full font-bold text-xs uppercase tracking-wide transition ${mode === 'signup' ? 'bg-[#675DFC] text-white shadow-sm' : 'text-[#A1A1AA] hover:text-white'}`}
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
                  className="w-full bg-[#141417] border border-[#2E2E38] rounded-[14px] px-4 py-3 text-white text-xs focus:border-[#675DFC] focus:ring-1 focus:ring-[#675DFC] outline-none transition placeholder-[#71717A]"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141417] border border-[#2E2E38] rounded-[14px] px-4 py-3 text-white text-xs focus:border-[#675DFC] focus:ring-1 focus:ring-[#675DFC] outline-none transition placeholder-[#71717A]"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-full bg-[#675DFC] hover:bg-[#786FFD] text-white font-bold text-xs tracking-wider uppercase transition shadow-md shadow-[#675DFC]/20 disabled:opacity-50"
                >
                  {busy ? 'Authenticating...' : mode === 'signup' ? 'Create Cloud Account' : 'Log In to Account'}
                </button>
              </form>

              {error && (
                <p className="bg-rose-500/10 border border-rose-500/30 rounded-[14px] p-3 text-rose-400 text-xs font-medium">
                  {error}
                </p>
              )}
              {message && (
                <p className="bg-emerald-500/10 border border-emerald-500/30 rounded-[14px] p-3 text-emerald-400 text-xs font-medium">
                  {message}
                </p>
              )}
            </>
          )}

          {/* Guest / Demo reset */}
          <div className="border-t border-[#2A2A32] pt-5 space-y-3">
            <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
              Local Storage Sandbox
            </p>
            <button
              type="button"
              onClick={() => onResetDemo?.()}
              className="w-full py-2.5 px-4 rounded-full bg-[#26262B] hover:bg-[#32323A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
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