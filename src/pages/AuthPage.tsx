import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(email, password);
        if (result.error) {
          setErrorMessage(result.error.message);
        } else if (result.message) {
          setInfoMessage(result.message);
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setErrorMessage(result.error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-light-bg dark:bg-night-bg text-light-text dark:text-night-text transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-pastel-yellow-ink dark:text-pastel-yellow stroke-[2]" />
            <span className="text-xs uppercase tracking-widest font-bold text-light-muted dark:text-night-muted">
              personal focus studio
            </span>
          </div>

          <h1 className="font-serif italic font-semibold text-4xl sm:text-5xl text-light-text dark:text-night-text tracking-tight flex items-center justify-center gap-2">
            <span>my space</span>
            <span className="text-pastel-yellow-ink dark:text-pastel-yellow not-italic text-2xl sm:text-3xl">✦</span>
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-light-muted dark:text-night-muted">
            {isSignUp ? 'create your calm workspace' : 'welcome back to your calm workspace'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          {/* Tab Selector */}
          <div className="flex rounded-2xl bg-light-bg dark:bg-night-elevated p-1 border-2 border-light-border/80 dark:border-night-border/80">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all btn-clean ${
                !isSignUp
                  ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs'
                  : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text'
              }`}
            >
              sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all btn-clean ${
                isSignUp
                  ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs'
                  : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text'
              }`}
            >
              create account
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Info Message */}
          {infoMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 stroke-[2]" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-semibold text-light-muted dark:text-night-muted block">
                email
              </label>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-light-bg dark:bg-night-elevated border-2 border-light-border dark:border-night-border rounded-2xl focus-within:border-pastel-yellow transition-all">
                <Mail className="w-4 h-4 text-light-muted dark:text-night-muted shrink-0 stroke-[2]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent text-sm text-light-text dark:text-night-text placeholder:text-light-muted/50 dark:placeholder:text-night-muted/50 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-semibold text-light-muted dark:text-night-muted block">
                password
              </label>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-light-bg dark:bg-night-elevated border-2 border-light-border dark:border-night-border rounded-2xl focus-within:border-pastel-yellow transition-all">
                <Lock className="w-4 h-4 text-light-muted dark:text-night-muted shrink-0 stroke-[2]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  className="w-full bg-transparent text-sm text-light-text dark:text-night-text placeholder:text-light-muted/50 dark:placeholder:text-night-muted/50 focus:outline-none font-medium"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs uppercase tracking-wider font-semibold text-light-muted dark:text-night-muted block">
                  confirm password
                </label>
                <div className="flex items-center gap-2.5 px-4 py-3 bg-light-bg dark:bg-night-elevated border-2 border-light-border dark:border-night-border rounded-2xl focus-within:border-pastel-yellow transition-all">
                  <Lock className="w-4 h-4 text-light-muted dark:text-night-muted shrink-0 stroke-[2]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full bg-transparent text-sm text-light-text dark:text-night-text placeholder:text-light-muted/50 dark:placeholder:text-night-muted/50 focus:outline-none font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg text-sm font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 btn-clean mt-2"
            >
              {loading ? (
                <span className="font-serif italic">connecting...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'create account' : 'sign in'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs font-serif italic text-light-muted dark:text-night-muted">
          there is a place for everything · focus on what matters
        </p>
      </div>
    </div>
  );
};
