'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ShieldCheck, UserMinus } from 'lucide-react';

interface UserRow { id: number; email: string; name: string | null; role: string; createdAt: string; hasPassword?: boolean; }

async function fetchUsers(signal?: AbortSignal): Promise<UserRow[]> {
  const res = await fetch('/api/admin/users?limit=200', { cache: 'no-store', signal: signal ?? null });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not load users');
  return data.data?.users || [];
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | 'create' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<UserRow | null>(null);
  const [replacementPassword, setReplacementPassword] = useState('');

  async function load() {
    try { setUsers(await fetchUsers()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load users'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const controller = new AbortController();
    void fetchUsers(controller.signal)
      .then(rows => { if (!controller.signal.aborted) setUsers(rows); })
      .catch(e => {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Could not load users');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy('create'); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');
      setSuccess(`Admin ${form.email} created. Share their password securely; it is not emailed.`);
      setForm({ name: '', email: '', password: '' }); setShowCreate(false);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to create admin'); }
    finally { setBusy(null); }
  }

  async function resetAdminPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordTarget) return;
    setBusy(passwordTarget.id); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/admin/users/${passwordTarget.id}/password`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ password: replacementPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');
      setSuccess(`Password updated for ${passwordTarget.email}. Their previous sessions are invalidated. Share the new password privately.`);
      setPasswordTarget(null); setReplacementPassword(''); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Password reset failed'); }
    finally { setBusy(null); }
  }

  async function changeRole(user: UserRow) {
    if (user.role === 'super_admin') return;
    const action = user.role === 'admin' ? 'demote' : 'promote';
    if (!window.confirm(`${action === 'demote' ? 'Revoke admin access for' : 'Promote'} ${user.email}?`)) return;
    setBusy(user.id); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/admin/users/${user.id}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not change role');
      setSuccess(`${user.email} updated. Revoked sessions will require a new login.`);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not change role'); }
    finally { setBusy(null); }
  }
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">People & permissions</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Only the super admin can grant and revoke administrator access.</p></div>
        <div className="flex gap-3"><Link className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" href="/dashboard">Back</Link><button className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2" onClick={() => setShowCreate(!showCreate)}><Plus size={18}/> New admin</button></div>
      </div>
      {error && <p role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300">{error}</p>}
      {success && <p role="status" className="p-3 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">{success}</p>}
      {showCreate && <form onSubmit={create} className="p-6 border rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4 max-w-xl">
        <h2 className="text-lg font-semibold">Create administrator</h2>
        <p className="text-sm text-gray-500">Choose a unique initial password (12+ characters, uppercase and number). Share it privately, not over public chat.</p>
        <label className="block text-sm">Full name<input required minLength={2} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-1 block w-full p-3 border rounded-lg bg-transparent dark:border-gray-700"/></label>
        <label className="block text-sm">Email<input required type="email" autoComplete="off" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-1 block w-full p-3 border rounded-lg bg-transparent dark:border-gray-700"/></label>
        <label className="block text-sm">Initial password<input required type="password" autoComplete="new-password" minLength={12} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-1 block w-full p-3 border rounded-lg bg-transparent dark:border-gray-700"/></label>
        <button disabled={busy==='create'} className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">{busy==='create'?'Creating...':'Create admin'}</button>
      </form>}
      {passwordTarget && <form onSubmit={resetAdminPassword} className="max-w-xl p-5 border rounded-xl dark:border-gray-700 space-y-3">
        <h2 className="text-lg font-semibold">{passwordTarget.hasPassword ? 'Reset' : 'Initialize'} admin password</h2>
        <p className="text-sm text-gray-500">For {passwordTarget.email}. This invalidates existing sessions. Verify their identity and share the password over a secure channel.</p>
        <label className="block text-sm">New password<input autoComplete="new-password" type="password" required minLength={12} value={replacementPassword} onChange={e=>setReplacementPassword(e.target.value)} className="w-full mt-1 p-3 border rounded-lg bg-transparent dark:border-gray-700"/></label>
        <div className="flex gap-3"><button disabled={busy===passwordTarget.id} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Save password</button><button type="button" onClick={()=>{setPasswordTarget(null);setReplacementPassword('')}} className="px-4 py-2 rounded-lg border dark:border-gray-700">Cancel</button></div>
      </form>}
      <div className="border rounded-xl border-gray-200 dark:border-gray-800 overflow-x-auto bg-white dark:bg-gray-900">
        {loading ? <p className="p-8 text-gray-500">Loading...</p> : <table className="w-full min-w-[600px] text-sm"><thead className="bg-gray-50 dark:bg-gray-800 text-left"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4 text-right">Action</th></tr></thead>
          <tbody>{users.map(user=><tr key={user.id} className="border-t border-gray-200 dark:border-gray-800"><td className="p-4">{user.name||'—'}</td><td className="p-4">{user.email}</td><td className="p-4"><span className="inline-flex gap-1 items-center font-medium">{user.role==='super_admin'&&<ShieldCheck size={16}/>} {user.role.replace('_',' ')}</span></td><td className="p-4 text-right">{user.role==='super_admin'?<span className="text-gray-400">Protected</span>:<div className="flex flex-wrap gap-4 justify-end">{user.role==='admin' && <button onClick={()=>{setPasswordTarget(user);setReplacementPassword('')}} className="text-blue-600">{user.hasPassword?'Reset password':'Set password'}</button>}<button disabled={busy===user.id} onClick={()=>changeRole(user)} className="inline-flex gap-1 items-center text-blue-600 disabled:opacity-40">{user.role==='admin'?<><UserMinus size={16}/> Revoke admin</>:'Promote'}</button></div>}</td></tr>)}</tbody>
        </table>}
      </div>
    </div>
  );
}
