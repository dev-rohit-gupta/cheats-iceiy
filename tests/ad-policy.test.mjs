import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdSlotAllowed } from '../lib/ads/policy.ts';
const base = { enabled: true, banners: true, native: true, sidebar: true, highperformanceformat: true, effectivecpmnetwork: true };
const banner = 'https://www.highperformanceformat.com/a1/invoke.js';
const native = 'https://pl29468349.effectivecpmnetwork.com/a1/invoke.js';
test('ads default fail closed', () => {
  assert.equal(isAdSlotAllowed(null, banner, 'home_top_banner'), false);
  assert.equal(isAdSlotAllowed({ ...base, enabled: false }, banner, 'home_top_banner'), false);
});
test('network and placement switches are independent', () => {
  assert.equal(isAdSlotAllowed({ ...base, banners: false }, banner, 'home_top_banner'), false);
  assert.equal(isAdSlotAllowed({ ...base, native: false }, native, 'home_inline_native'), false);
  assert.equal(isAdSlotAllowed({ ...base, highperformanceformat: false }, banner, 'home_top_banner'), false);
  assert.equal(isAdSlotAllowed(base, native, 'home_inline_native'), true);
});
test('never load unexpected origins or unencrypted ads', () => {
  for (const src of ['http://www.highperformanceformat.com/invoke.js', 'https://evil.example/invoke.js', 'https://www.highperformanceformat.com.evil.example/x', 'badurl']) {
    assert.equal(isAdSlotAllowed(base, src, 'home_top_banner'), false);
  }
});
