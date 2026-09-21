'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  KeyRound, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Send
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAppStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    soundFx.playClick();

    try {
      const res = await sendPasswordResetEmail(email.trim());
      if (res.success) {
        setIsSubmitted(true);
        soundFx.playLevelUp();
      } else {
        setErrorMsg(res.error || 'Could not send password reset email.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error processing request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-[#00F0FF]/15 via-[#ADFF2F]/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00F0FF]/20 to-[#ADFF2F]/20 border border-[#00F0FF]/30 shadow-[0_0_25px_rgba(0,240,255,0.25)] mb-4">
            <KeyRound className="w-7 h-7 text-[#00F0FF]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Reset Password
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Enter your email and we'll send you an encrypted password recovery link
          </p>
        </div>

        <div className="bg-[#121624]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative">
          <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Reset Error</p>
                <p className="text-xs text-red-400/90 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Check Your Inbox</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an account exists for <span className="text-[#00F0FF] font-semibold">{email}</span>, we have dispatched a secure password reset link. Please check your spam folder if it doesn't arrive within 2 minutes.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-bold uppercase tracking-wider transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Account Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gamer@chillarena.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#0a0d18]/90 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#00F0FF] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
