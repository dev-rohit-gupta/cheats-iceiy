'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { ShieldCheck, LockKeyhole, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(), password, redirect: false,
      });
      if (!result?.ok) {
        setError('Invalid email or password. Please check your credentials.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Sign-in could not be completed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl shadow-gray-900/5 p-8 sm:p-10">
        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-6"><ShieldCheck size={25} /></div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">Sign in to your account with email and password. No OTP required.</p>
        {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-300">{error}</div>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium mb-2">Email address</label>
            <input id="login-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-blue-600">{showPassword ? <EyeOff size={21}/> : <Eye size={21}/>}</button>
            </div>
          </div>
          <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 py-3 text-white font-semibold transition-colors"><LockKeyhole size={18} />{isLoading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-7">Need an account? <Link href="/auth/signup" className="font-medium text-blue-600 dark:text-blue-400">Sign up</Link></p>
      </div>
    </div>
  );
}
