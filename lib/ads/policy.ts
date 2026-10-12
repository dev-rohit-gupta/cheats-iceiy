import type { AdSettings } from "./settings";

const PROVIDERS: Record<string, keyof Pick<AdSettings, "highperformanceformat" | "effectivecpmnetwork">> = {
  "www.highperformanceformat.com": "highperformanceformat",
  "pl29468349.effectivecpmnetwork.com": "effectivecpmnetwork",
};

export function isAdSlotAllowed(settings: AdSettings | null, source: string | undefined, slotId: string): boolean {
  if (!settings?.enabled || !source) return false;
  let hostname: string;
  try {
    const url = new URL(source);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    hostname = url.hostname;
  } catch { return false; }
  const provider = PROVIDERS[hostname];
  if (!provider || !settings[provider]) return false;
  const format = slotId.includes("native") ? "native" : slotId.includes("sidebar") ? "sidebar" : "banners";
  return settings[format];
}
