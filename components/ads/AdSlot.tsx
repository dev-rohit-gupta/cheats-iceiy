'use client';

import { useEffect, useMemo, useState } from 'react';
import { isAdSlotAllowed } from '@/lib/ads/policy';
import type { AdSettings } from '@/lib/ads/settings';

// One no-store request per page load; disabled on errors.
let adConfigPromise: Promise<AdSettings | null> | null = null;
function loadAdConfig(): Promise<AdSettings | null> {
  if (!adConfigPromise) {
    adConfigPromise = fetch('/api/ads/settings', { cache: 'no-store' })
      .then(r => r.ok ? r.json() as Promise<AdSettings> : null).catch(() => null);
  }
  return adConfigPromise;
}

type AdSlotProps = {
  slotId: string;
  containerId?: string;
  className?: string;
  minHeight?: number;
  scriptSrc?: string;
  inlineScript?: string;
  scriptAttributes?: Record<string, string>;
  label?: string;
};

export function AdSlot({
  slotId, containerId, className, minHeight = 90, scriptSrc, inlineScript, label = 'Advertisement',
}: AdSlotProps) {
  const [config, setConfig] = useState<AdSettings | null>(null);
  useEffect(() => { let mounted = true; void loadAdConfig().then(v => { if (mounted) setConfig(v); }); return () => { mounted = false; }; }, []);

  const permitted = isAdSlotAllowed(config, scriptSrc, slotId);

  // A sandboxed opaque-origin iframe ensures a hostile ad cannot navigate the host
  // page or open pop-ups. Each placement has isolated globals and container IDs.
  const markup = useMemo(() => {
    if (!permitted || !scriptSrc) return '';
    const container = containerId ? `<div id="${containerId}"></div>` : '';
    const optionsScript = inlineScript ? `<script>${inlineScript.replace(/<\/script/gi, '<\\/script')}</script>` : '';
    const safeSrc = scriptSrc.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><style>html,body{margin:0;overflow:hidden}*{box-sizing:border-box}</style></head><body>${container}${optionsScript}<script src="${safeSrc}" async></script></body></html>`;
  }, [containerId, inlineScript, permitted, scriptSrc]);

  if (!permitted) return null;
  return (
    <div data-ad-slot={slotId} className={className} style={{ minHeight }}>
      <iframe
        title={label}
        srcDoc={markup}
        sandbox="allow-scripts"
        loading="lazy"
        referrerPolicy="no-referrer"
        style={{ display: 'block', width: '100%', height: minHeight, border: 0 }}
      />
    </div>
  );
}
