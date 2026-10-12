'use client';
import { useEffect, useState } from 'react';

export default function AccountSecurityPage() {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ currentPassword: '', password: '', confirmPassword: '' });
  useEffect(() => {
    fetch('/api/auth/password/status', { cache: 'no-store' }).then(r => r.json()).then(data => {
      if (typeof data.hasPassword === 'boolean') setHasPassword(data.hasPassword);
      setGoogleConnected(Boolean(data.googleConnected));
    }).catch(() => setError('Could not load account status'));
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      const endpoint = hasPassword ? '/api/auth/password/change' : '/api/auth/password/set';
      const body = hasPassword ? { currentPassword: form.currentPassword, newPassword: form.password, confirmPassword: form.confirmPassword } : { password: form.password, confirmPassword: form.confirmPassword };
      const res = await fetch(endpoint, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed');
      setSuccess('Password updated. Sign in again if your existing session has expired.');
      setHasPassword(true); setForm({ currentPassword: '', password: '', confirmPassword: '' });
    } catch(e) { setError(e instanceof Error ? e.message : 'Password update failed'); }
    finally {setLoading(false);}
  }
  return <div className="max-w-3xl space-y-6">
    <div><h1 className="text-3xl font-bold">Account security</h1><p className="text-gray-500 mt-2">Manage how you sign in, without email OTP.</p></div>
    <div className="grid md:grid-cols-2 gap-6">
      <section className="p-6 border rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h2 className="text-xl font-semibold mb-4">{hasPassword ? 'Change password' : 'Set a password'}</h2>
        {error&&<p role="alert" className="text-red-600 mb-3 text-sm">{error}</p>}{success&&<p role="status" className="text-green-600 mb-3 text-sm">{success}</p>}
        {hasPassword===null?<p>Loading...</p>:<form onSubmit={submit} className="space-y-4">
          {hasPassword&&<label className="block text-sm">Current password<input required autoComplete="current-password" type="password" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})} className="mt-1 w-full p-2 border rounded-lg bg-transparent dark:border-gray-700"/></label>}
          <label className="block text-sm">New password<input required minLength={8} autoComplete="new-password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-1 w-full p-2 border rounded-lg bg-transparent dark:border-gray-700"/></label>
          <label className="block text-sm">Confirm password<input required type="password" autoComplete="new-password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} className="mt-1 w-full p-2 border rounded-lg bg-transparent dark:border-gray-700"/></label>
          <p className="text-xs text-gray-500">At least 8 characters, an uppercase letter and a number.</p>
          <button disabled={loading} className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">{loading?'Saving...':'Save password'}</button>
        </form>}
      </section>
      <section className="p-6 border rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h2 className="text-xl font-semibold mb-4">Connected accounts</h2>
        <p className="text-sm">Google OAuth <span className="font-semibold">{googleConnected ? 'Connected' : 'Not connected'}</span></p>
        <p className="mt-3 text-xs text-gray-500">Administrator accounts must use their password. Google login is available only to regular users where configured.</p>
      </section>
    </div>
  </div>;
}
