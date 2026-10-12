'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Megaphone } from 'lucide-react';
import type { AdSettings } from '@/lib/ads/settings';

const fields: { key: keyof AdSettings; title: string; description: string }[] = [
  { key: 'enabled', title: 'Show advertisements', description: 'Master switch: off means no ad scripts load.' },
  { key: 'banners', title: 'Banner placements', description: 'Home and resource page banners.' },
  { key: 'native', title: 'Native placements', description: 'Inline native content units.' },
  { key: 'sidebar', title: 'Sidebar placements', description: 'Desktop side-column ads.' },
  { key: 'highperformanceformat', title: 'High Performance Format network', description: 'Third-party network: may redirect visitors. Disabled by default.' },
  { key: 'effectivecpmnetwork', title: 'Effective CPM Network', description: 'Third-party network: may redirect visitors. Disabled by default.' },
];
export default function AdSettingsPage() {
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    fetch('/api/admin/ads/settings', { cache: 'no-store' }).then(async r => {
      const data = await r.json(); if (!r.ok) throw new Error(data.error || 'Failed to load settings'); setSettings(data);
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);
  async function save() {
    if (!settings) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const r = await fetch('/api/admin/ads/settings', { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(settings) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Save failed');
      setSuccess('Saved. Reload open resource pages to apply the new configuration.');
    } catch(e) { setError(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  }
  return <div className="max-w-3xl space-y-6">
    <div className="flex flex-wrap justify-between gap-4 items-center"><div><h1 className="text-3xl font-bold flex items-center gap-2"><Megaphone/> Advertisement settings</h1><p className="mt-2 text-gray-500">Super-admin controls for scripts and placements.</p></div><Link href="/dashboard" className="border rounded-lg px-4 py-2 dark:border-gray-700">Back</Link></div>
    <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-5 text-amber-950 dark:text-amber-100 flex items-start gap-3"><ShieldAlert className="shrink-0"/><div><p className="font-semibold">Redirect protection</p><p className="text-sm mt-1">These providers are disabled by default. Ad scripts run in isolated sandboxed frames without permission to navigate the main page or open popups. A provider can still behave badly inside its frame, so leave suspect networks switched off.</p></div></div>
    {error&&<p role="alert" className="rounded-lg p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300">{error}</p>}
    {success&&<p role="status" className="rounded-lg p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">{success}</p>}
    {loading?<p>Loading settings...</p>:settings&&<div className="border rounded-xl border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
      {fields.map(field=><label key={field.key} className="flex items-center justify-between gap-5 p-5 border-b last:border-b-0 border-gray-100 dark:border-gray-800 cursor-pointer"><span><span className="block font-semibold">{field.title}</span><span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">{field.description}</span></span><input className="w-5 h-5 accent-blue-600 shrink-0" type="checkbox" checked={settings[field.key]} onChange={e=>setSettings({...settings,[field.key]:e.target.checked})}/></label>)}
    </div>}
    {settings&&<button disabled={saving} onClick={save} className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving?'Saving...':'Save settings'}</button>}
    <p className="text-sm text-gray-500">Emergency block: set <code>ADS_EMERGENCY_OFF=true</code> on the server. There is no toggle that can guarantee a third-party provider will never attempt redirects; turn off its network to stop loading its scripts.</p>
  </div>;
}
