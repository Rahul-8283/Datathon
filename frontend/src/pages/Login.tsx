import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuthStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both official email address and security password.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          setSession(data.session);
          navigate(from, { replace: true });
        } else {
          setSuccessMessage('Officer profile created! A confirmation email has been dispatched. Please verify to sign in.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          setSession(data.session);
          navigate(from, { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07110f] text-slate-200 flex flex-col justify-between selection:bg-[#c6a75b]/35 relative overflow-hidden font-sans">
      {/* Background Radial Glow */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(circle_at_72%_18%,rgba(40,137,113,0.25),transparent_27%),radial-gradient(circle_at_15%_12%,rgba(198,167,91,0.12),transparent_22%)]" />

      {/* Full-Width Navbar matching Landing & Dashboard */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07110f]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-none bg-[#c6a75b] text-[#10231d]">
              <ShieldCheck size={19} />
            </span>
            <div>
              <span className="font-display block text-lg font-bold tracking-tight text-white">KSP Intelligence</span>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-100/45">State Crime Records Bureau</p>
            </div>
          </Link>
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-wider text-[#c6a75b] hover:text-[#e0c477] transition-colors"
          >
            ← Return to Overview
          </Link>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md bg-[#0c211b]/95 border border-white/10 rounded-none p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/50 space-y-6 relative">
          
          {/* Decorative Grid Accent */}
          <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:linear-gradient(rgba(120,200,168,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(120,200,168,.12)_1px,transparent_1px)] [background-size:28px_28px]" />

          <div className="relative z-10 text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-none border border-emerald-200/15 bg-emerald-300/[0.06] px-3 py-1.5 text-xs font-semibold text-emerald-100/80 mb-1">
              <Sparkles size={13} className="text-[#d8bb70]" />
              Restricted Officer Portal
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
              {isSignUp ? 'Officer Registration' : 'Command Sign In'}
            </h2>
            <p className="text-xs leading-5 text-slate-400">
              {isSignUp
                ? 'Register your official credentials to access state intelligence feeds'
                : 'Authenticate your session to enter the analytical command workspace'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="relative z-10 grid grid-cols-2 p-1 bg-[#102a23] border border-white/10 rounded-none text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-[#c6a75b] text-[#10231d] font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-[#c6a75b] text-[#10231d] font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="relative z-10 p-3.5 bg-red-950/70 border border-red-500/30 rounded-none flex items-start space-x-3 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="relative z-10 p-3.5 bg-emerald-950/70 border border-emerald-500/30 rounded-none flex items-start space-x-3 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="relative z-10 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400 font-mono">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@ksp.gov.in"
                  className="w-full bg-[#102a23] border border-white/12 rounded-none py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c6a75b] focus:ring-1 focus:ring-[#c6a75b] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400 font-mono">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#102a23] border border-white/12 rounded-none py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c6a75b] focus:ring-1 focus:ring-[#c6a75b] transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 bg-[#c6a75b] hover:bg-[#e0c477] text-[#11231e] font-bold text-xs uppercase tracking-[.16em] rounded-none transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#c6a75b]/20 mt-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#11231e]/30 border-t-[#11231e] rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Officer Profile' : 'Authenticate & Enter'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative z-10 pt-2 text-center text-[10px] uppercase tracking-widest text-slate-500 border-t border-white/8 font-mono">
            Restricted System · Karnataka Police Security Protocol
          </div>
        </div>
      </main>

      {/* Footer matching Landing & Dashboard */}
      <footer className="border-t border-white/8 px-5 py-6 text-center text-xs text-slate-500 font-mono">
        © 2026 Karnataka State Police · Strategic Crime Intelligence Hub
      </footer>
    </div>
  );
};

export default Login;
