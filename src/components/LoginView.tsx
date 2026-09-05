import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { UserRole, UserProfile } from '../types';
import { DomainAuthNotice } from './DomainAuthNotice';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  Phone,
  Briefcase,
  Award,
  ShieldCheck,
  Compass,
  HardHat,
  Calculator,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users,
  KeyRound,
  Zap,
  RefreshCw
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    users,
    login,
    registerUser,
    signInWithGoogle,
    signInDirectCloud,
    cloudSyncStatus,
    unauthorizedDomain,
    cloudSyncError
  } = useCasabuild();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('Ar.khanaamir@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('architect');
  const [regDesignation, setRegDesignation] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regLicense, setRegLicense] = useState('');

  const roleMeta: Record<UserRole, { label: string; icon: any; color: string; badge: string }> = {
    architect: { label: 'Architect & Design Lead', icon: Compass, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30', badge: 'Architectural' },
    owner: { label: 'Managing Director / Owner', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30', badge: 'Executive' },
    supervisor: { label: 'Site Supervisor & Engineer', icon: HardHat, color: 'text-sky-400 bg-sky-500/15 border-sky-500/30', badge: 'Field Ops' },
    accountant: { label: 'Chief Financial Officer', icon: Calculator, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30', badge: 'Accounts' },
    contractor: { label: 'Turnkey Contractor', icon: UserCheck, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30', badge: 'Contractor' },
    client: { label: 'Client & Property Owner', icon: Eye, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30', badge: 'Client Portal' },
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
        setSubmitting(false);
      }
      // On success, state updates and view will switch automatically
    }, 200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please fill in all mandatory fields (Name, Email, Password).');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const res = registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        designation: regDesignation.trim() || roleMeta[regRole].label,
        phone: regPhone.trim() || '+91 98000 00000',
        companyOrAffiliation: regCompany.trim() || 'The Casabuild Group',
        licenseNumber: regLicense.trim() || `CB-REG-${Math.floor(1000 + Math.random() * 9000)}`,
        assignedProjects: ['ALL'],
        permissions: []
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
        setSubmitting(false);
      }
    }, 250);
  };

  const autofillPredefinedUser = (user: UserProfile) => {
    setEmail(user.email);
    setPassword(user.password || 'password123');
    setErrorMsg(null);
    setSuccessMsg(`Selected: ${user.name} (${roleMeta[user.role].label}). Click "Sign In" below or press Enter.`);
  };

  const handleDirectSignIn = (user: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);
    setTimeout(() => {
      const res = login(user.email, user.password || 'password123');
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed.');
        setSubmitting(false);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#0d0f15] text-zinc-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Architectural Header */}
      <header className="px-4 py-4 sm:px-8 border-b border-zinc-800/80 bg-[#12151d]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-bold text-lg shadow-lg shadow-amber-500/20">
              <span className="font-['Cinzel',serif]">CB</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-['Cinzel',serif] text-base sm:text-lg font-bold tracking-wider text-zinc-100">
                  THE CASABUILD
                </span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-zinc-700">
                  ERP v3.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 tracking-wider">
                ARCHITECTURE <span className="text-amber-500">•</span> INTERIORS <span className="text-amber-500">•</span> CONSTRUCTION
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-mono">Enterprise Security Portal</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card & Predefined User Selector */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Authentic Predefined User Roster */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border border-zinc-800 bg-[#161922] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <KeyRound className="h-4 w-4 text-amber-400" />
                  <h2 className="text-sm font-bold tracking-wide text-zinc-100 uppercase">
                    Predefined System Profiles
                  </h2>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                  One-Click Fill
                </span>
              </div>

              <p className="text-xs text-zinc-400 mt-2 mb-4 leading-relaxed">
                Roles and security boundaries are strictly predefined per verified profile. Click any profile below to autofill their email and password:
              </p>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {users.map(u => {
                  const meta = roleMeta[u.role] || roleMeta.architect;
                  const Icon = meta.icon;
                  const isHighlighted = email.toLowerCase() === u.email.toLowerCase();

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => autofillPredefinedUser(u)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start space-x-3 group ${
                        isHighlighted
                          ? 'border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="h-10 w-10 rounded-xl object-cover ring-1 ring-zinc-700"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-bold">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 rounded-full p-0.5 bg-zinc-900 border border-zinc-700">
                          <Icon className="h-3 w-3 text-amber-400" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 transition truncate">
                            {u.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${meta.color}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                          {u.email}
                        </p>
                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-zinc-800/60">
                          <span className="text-[10px] text-zinc-400">Password: <span className="font-mono text-zinc-400">••••••••</span></span>
                          <span
                            onClick={(e) => handleDirectSignIn(u, e)}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 font-bold text-[10px] transition border border-amber-500/30"
                          >
                            <span>Sign In</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Default Password for all:</span>
                <code className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-amber-300 font-mono">
                  password123
                </code>
              </div>
            </div>
          </div>

          {/* Right Column: Active Login / Register Form */}
          <div className="lg:col-span-7">
            <div className="border border-zinc-800 bg-[#161922] rounded-2xl p-6 sm:p-8 shadow-2xl">
              
              {/* Form Mode Selector Tabs */}
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-4 mb-6">
                <button
                  type="button"
                  id="tab-sign-in"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    mode === 'login'
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Sign In to Workspace</span>
                </button>

                <button
                  type="button"
                  id="tab-register-user"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    mode === 'register'
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Register Predefined Role</span>
                </button>
              </div>

              {/* Master Owner Quick Access Banner */}
              <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm shadow-sm shrink-0">
                      AK
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-zinc-100">Ar. Aamir Khan</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">Master Owner</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">Ar.khanaamir@gmail.com</p>
                    </div>
                  </div>
                  <button
                    id="one-click-master-login-btn"
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSubmitting(true);
                      const res = login('Ar.khanaamir@gmail.com', 'password123');
                      if (!res.success) {
                        setErrorMsg(res.error || 'Login failed');
                        setSubmitting(false);
                      }
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 transition active:scale-95 shrink-0"
                  >
                    <span>Instant Enter ERP</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Status & Feedback Alerts */}
              {(unauthorizedDomain || errorMsg?.includes('unauthorized-domain')) ? (
                <DomainAuthNotice
                  onRetryGoogle={async () => {
                    setErrorMsg(null);
                    setSubmitting(true);
                    try {
                      await signInWithGoogle();
                    } catch (err: any) {
                      setErrorMsg(err.message || 'Google Cloud Sign-In failed.');
                      setSubmitting(false);
                    }
                  }}
                  className="mb-5"
                />
              ) : errorMsg ? (
                <div className="mb-5 flex items-start space-x-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              ) : null}

              {successMsg && (
                <div className="mb-5 flex items-start space-x-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Login Form */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Email Address (Login ID)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        id="login-email-input"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. Ar.khanaamir@gmail.com"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-zinc-300">
                        Security Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setPassword('password123');
                          setSuccessMsg('Default password autofilled ("password123").');
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 transition"
                      >
                        Autofill Default Password
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
                      />
                      <span>Keep me signed in</span>
                    </label>
                    <span className="text-[11px] text-zinc-500">
                      Encrypted Cloud Session
                    </span>
                  </div>

                  <button
                    id="submit-login-btn"
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-4 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-5 py-3 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition disabled:opacity-50"
                  >
                    <span>{submitting ? 'Authenticating Profile...' : 'Sign In to Casabuild ERP'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-zinc-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-zinc-500 font-medium">multi-device cloud access</span>
                    <div className="flex-grow border-t border-zinc-800"></div>
                  </div>

                  <div className="space-y-2">
                    <button
                      id="google-cloud-sync-login-btn"
                      type="button"
                      disabled={submitting}
                      onClick={async () => {
                        setErrorMsg(null);
                        setSubmitting(true);
                        try {
                          await signInWithGoogle();
                        } catch (err: any) {
                          setErrorMsg(err.message || 'Google Cloud Sign-In failed.');
                          setSubmitting(false);
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-2.5 rounded-xl border border-zinc-700 hover:border-amber-500/50 bg-zinc-900/90 hover:bg-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:text-white transition shadow-sm disabled:opacity-50"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign In with Google (Cloud Sync)</span>
                    </button>

                    <button
                      id="direct-cloud-connect-btn"
                      type="button"
                      disabled={submitting}
                      onClick={async () => {
                        setErrorMsg(null);
                        setSubmitting(true);
                        try {
                          await signInDirectCloud();
                          setSuccessMsg('Direct cloud session connected successfully! Syncing database...');
                        } catch (err: any) {
                          setErrorMsg(err.message || 'Direct cloud session failed.');
                          setSubmitting(false);
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/70 hover:bg-zinc-900/90 px-4 py-2 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition disabled:opacity-50"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span>Instant Direct Cloud Connect (Bypass Google Popup)</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Registration Form */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Full Name & Title *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          placeholder="e.g. Ar. Sameer Kapoor"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Official Email ID *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          placeholder="e.g. sameer@casabuild.com"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Predefined Security Role *
                      </label>
                      <select
                        value={regRole}
                        onChange={e => setRegRole(e.target.value as UserRole)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                      >
                        <option value="architect">Architect & Design Lead</option>
                        <option value="owner">Owner / Executive Director</option>
                        <option value="supervisor">Site Supervisor & Engineer</option>
                        <option value="accountant">Chief Financial Officer / Accounts</option>
                        <option value="contractor">Civil / MEP Contractor</option>
                        <option value="client">Client / Property Owner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Account Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Designation / Job Title
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          value={regDesignation}
                          onChange={e => setRegDesignation(e.target.value)}
                          placeholder="e.g. Senior Associate Architect"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Contact Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          placeholder="+91 98111 22334"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Company / Firm
                      </label>
                      <input
                        type="text"
                        value={regCompany}
                        onChange={e => setRegCompany(e.target.value)}
                        placeholder="e.g. Studio Arcform"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        License / Registration ID
                      </label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          value={regLicense}
                          onChange={e => setRegLicense(e.target.value)}
                          placeholder="e.g. COA CA/2023/1209"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-3 text-[11px] text-zinc-400">
                    <p className="font-semibold text-zinc-300 mb-1">Automatic Role Provisioning:</p>
                    <p>
                      Choosing <span className="text-amber-400 font-medium">{roleMeta[regRole].label}</span> will automatically configure all enterprise module permissions, access barriers, and site ledger bindings.
                    </p>
                  </div>

                  <button
                    id="submit-register-btn"
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-5 py-3 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition disabled:opacity-50"
                  >
                    <span>{submitting ? 'Registering...' : 'Complete Profile Registration & Sign In'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Architectural Bottom Footer */}
      <footer className="px-4 py-4 sm:px-8 border-t border-zinc-800/80 bg-[#12151d] text-center text-xs text-zinc-500">
        <p>
          The Casabuild ERP System • Precision Architecture, Turnkey Civil Engineering & Interior Operations.
        </p>
      </footer>
    </div>
  );
};
