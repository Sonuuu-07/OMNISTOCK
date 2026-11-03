import React, { useState } from 'react';
import { Building2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const demoAccounts: Array<{
  role: string;
  email: string;
  password: string;
  description: string;
}> = [
  {
    role: 'Startup Merchant',
    email: 'founder@vayutech.in',
    password: 'Startup2026!',
    description: 'Manage products, inventory, and orders.',
  },
  {
    role: 'Warehouse Manager',
    email: 'pooja.i@omnistock.logistics',
    password: 'Warehouse2026!',
    description: 'Oversee warehouse operations and fulfillment.',
  },
  {
    role: 'Logistics Admin',
    email: 'admin@omnistock.in',
    password: 'AdminPass2026!',
    description: 'Explore the full logistics workspace.',
  },
  {
    role: 'Compliance Auditor',
    email: 'ananya.sen@fssai-audit.in',
    password: 'Audit2026!',
    description: 'Review compliance and audit activity.',
  },
];

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemo = (account: typeof demoAccounts[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="absolute -top-40 -right-28 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-10 flex items-center gap-3 sm:mb-14">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/40">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">OmniStock</div>
            <div className="text-xs text-slate-400">Warehouse &amp; Inventory Management</div>
          </div>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <section className="pt-2 sm:pt-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200">
              <ShieldCheck className="h-4 w-4" /> Demo access available
            </div>
            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Your operations, all in one place.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
              Sign in to explore warehouse operations, inventory, orders, logistics tools, and the engineering labs.
            </p>

            <div className="mt-9">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Choose a demo account</h2>
                <span className="text-xs text-slate-400">Select one to fill the form</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => selectDemo(account)}
                    className={`rounded-xl border p-4 text-left transition-colors ${email === account.email ? 'border-blue-400 bg-blue-500/15' : 'border-slate-700 bg-slate-900/70 hover:border-slate-500 hover:bg-slate-900'}`}
                  >
                    <span className="block text-sm font-semibold text-white">{account.role}</span>
                    <span className="mt-1 block text-xs text-slate-400">{account.description}</span>
                    <span className="mt-3 block break-all font-mono text-[11px] text-blue-200">{account.email}</span>
                    <span className="mt-1 block font-mono text-[11px] text-slate-300">Password: {account.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-white p-6 text-slate-900 shadow-2xl shadow-black/20 sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Welcome to OmniStock</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Sign in to your account</h2>
              <p className="mt-1 text-sm text-slate-500">Use a demo account or enter your credentials.</p>
            </div>

            {error && (
              <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
              Demo environment · Choose any demo account to get started
            </div>
          </section>
        </div>

        <footer className="mt-12 text-center text-xs text-slate-500">OmniStock · Warehouse &amp; Inventory Management</footer>
      </div>
    </main>
  );
};
