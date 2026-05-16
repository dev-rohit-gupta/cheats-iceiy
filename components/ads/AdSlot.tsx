'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
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
  slotId,
  containerId,
  className,
  minHeight = 90,
  scriptSrc,
  inlineScript,
  scriptAttributes,
  label = 'Advertisement',
}: AdSlotProps) {
  if (!ADS_ENABLED) {
    return null;
  }

  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) {
      return;
    }

    trackedRef.current = true;

    const detail = {
      slotId,
      label,
      path: window.location.pathname,
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'ad_slot_rendered', ...detail });

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'ad_slot_rendered', detail);
    }

    window.dispatchEvent(new CustomEvent('ad-slot-rendered', { detail }));
  }, [label, slotId]);

  return (
    <div
      data-ad-slot={slotId}
      id={containerId}
      aria-label={label}
      className={className}
      style={{ minHeight }}
    >
      {inlineScript ? (
        <Script id={`ad-inline-${slotId}`} strategy="afterInteractive">
          {inlineScript}
        </Script>
      ) : null}
      {scriptSrc ? (
        <Script
          id={`ad-script-${slotId}`}
          strategy="afterInteractive"
          src={scriptSrc}
          {...(scriptAttributes || {})}
        />
      ) : null}
    </div>
  );
}
