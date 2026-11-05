import { test, expect } from '@playwright/test';

const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
// Illustrative isolated fixtures, never written to production or represented as official hours.
const fixtureSettings = () => ({ scheduleConfigured: false, openingSoonMinutes: 60,
  weeklyHours: days.map(day => ({ day, closed: false, openTime: '', closeTime: '' })), holidays: [],
  temporaryClosure: { active: false, reason: '' }, manualOverride: 'none', manualOverrideReason: '' });
const snapshot = (state, lifetime = 15000) => {
  const confirmed = state !== 'unconfirmed';
  const now = Date.now();
  return { status: state, label: { open: 'Open Now', closed: 'Closed Now', unconfirmed: 'Hours Not Confirmed' }[state],
    scheduleConfigured: confirmed, timeZone: 'Asia/Kolkata', nextOpening: null,
    checkedAt: new Date(now).toISOString(), validUntil: new Date(now + lifetime).toISOString(),
    today: confirmed ? { date: '2026-11-05', day: 'thursday', closed: false, openTime: '10:15', closeTime: '16:45' } : null,
    message: state === 'closed' ? 'Emergency closure for maintenance.' : confirmed ? 'Confirmed visitor hours.' : 'Official sanctuary hours have not been confirmed.',
    hours: { ...fixtureSettings(), scheduleConfigured: confirmed, weeklyHours: confirmed ? days.map(day => ({ day, closed: false, openTime: '10:15', closeTime: '16:45' })) : [] } };
};

async function stubStream(page) {
  await page.addInitScript(() => {
    window.EventSource = class {
      constructor() { this.listeners = {}; window.sanctuaryTestStream = this; }
      addEventListener(name, callback) { this.listeners[name] = callback; }
      close() {}
    };
  });
}
const badge = page => page.locator('header').getByRole('button', { name: /View sanctuary hours/ }).filter({ visible: true });
const refresh = page => page.evaluate(() => window.sanctuaryTestStream.listeners.refresh());

for (const width of [320, 375, 390, 768, 1440]) {
  test(`three status badges and accessible information panel work at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await stubStream(page);
    let state = 'unconfirmed';
    let failing = false;
    await page.route('**/api/**', route => {
      if (new URL(route.request().url()).pathname === '/api/sanctuary/status') {
        return route.fulfill({ status: failing ? 503 : 200, json: failing ? { success: false } : { success: true, data: snapshot(state) } });
      }
      return route.fulfill({ json: { success: true, data: [] } });
    });
    await page.goto('/');
    await expect(badge(page)).toHaveCount(1);
    await expect(badge(page)).toContainText('Hours Not Confirmed');
    await expect(badge(page).locator('[data-status]')).toHaveClass(/bg-stone-500/);
    await badge(page).click();
    let panel = page.getByRole('dialog', { name: 'Sanctuary hours details' });
    await expect(panel).toContainText('Official hours not confirmed');
    await expect(panel).not.toContainText('9:00');
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(badge(page)).toBeFocused();
    state = 'open';
    await refresh(page);
    await expect(badge(page)).toContainText('Open Now');
    await expect(badge(page).locator('[data-status]')).toHaveClass(/bg-emerald-600/);
    await badge(page).click();
    panel = page.getByRole('dialog', { name: 'Sanctuary hours details' });
    await expect(panel).toContainText('10:15 AM');
    await expect(panel).toContainText('4:45 PM');
    await expect(panel).toContainText('Asia/Kolkata');
    if (width === 375 || width === 1440) await page.screenshot({ path: testInfo.outputPath('sanctuary-status-panel.png') });
    const bounds = await panel.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(900);
    await panel.getByRole('button', { name: 'Close sanctuary information' }).click();
    state = 'closed';
    await refresh(page);
    await expect(badge(page)).toContainText('Closed Now');
    await expect(badge(page).locator('[data-status]')).toHaveClass(/bg-rose-600/);
    await badge(page).click();
    await expect(page.getByRole('dialog')).toContainText('Emergency closure for maintenance');
    failing = true;
    await refresh(page);
    await expect(badge(page)).toContainText('Hours Not Confirmed');
    await expect(page.getByRole('dialog')).toContainText('cannot verify');
    await expect(page.locator('header')).not.toContainText('Open Now');
    await expect(page.locator('body')).not.toContainText('Status unavailable');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('expired open snapshots disappear when the next request fails', async ({ page }) => {
  await page.clock.install();
  await stubStream(page);
  let failing = false;
  await page.route('**/api/**', route => new URL(route.request().url()).pathname === '/api/sanctuary/status'
    ? route.fulfill({ status: failing ? 503 : 200, json: failing ? { success: false } : { success: true, data: snapshot('open', 2000) } })
    : route.fulfill({ json: { success: true, data: [] } }));
  await page.goto('/');
  await expect(badge(page)).toContainText('Open Now');
  failing = true;
  await page.clock.fastForward(2100);
  await expect(badge(page)).toContainText('Hours Not Confirmed');
});

test('late open responses cannot overwrite a newer closure', async ({ page }) => {
  await stubStream(page);
  let reads = 0;
  let release;
  const stalled = new Promise(resolve => { release = resolve; });
  await page.route('**/api/**', async route => {
    if (new URL(route.request().url()).pathname !== '/api/sanctuary/status') return route.fulfill({ json: { success: true, data: [] } });
    if (++reads === 1) { await stalled; return route.fulfill({ json: { success: true, data: snapshot('open') } }).catch(() => {}); }
    return route.fulfill({ json: { success: true, data: snapshot('closed') } });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => reads).toBe(1);
  await refresh(page);
  await expect(badge(page)).toContainText('Closed Now');
  release();
  await expect(badge(page)).toContainText('Closed Now');
  expect(reads).toBeGreaterThanOrEqual(2);
});

test('admin explicitly verifies entered hours, saves with admin authorization, and immediately refreshes header', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await stubStream(page);
  await page.addInitScript(() => localStorage.setItem('adminToken', 'fixture-admin-token'));
  let state = 'unconfirmed';
  let settings = fixtureSettings();
  let saves = 0;
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/admin/me') return route.fulfill({ json: { admin: { role: 'admin', name: 'Fixture', mustChangePassword: false } } });
    if (path === '/api/sanctuary/status') return route.fulfill({ json: { success: true, data: snapshot(state) } });
    if (path === '/api/sanctuary/admin/settings') {
      expect(route.request().headers().authorization).toBe('Bearer fixture-admin-token');
      if (route.request().method() === 'PUT') {
        settings = route.request().postDataJSON();
        expect(settings.scheduleConfigured).toBe(true);
        expect(settings.weeklyHours).toHaveLength(7);
        saves++;
        state = 'open';
        return route.fulfill({ json: { success: true, data: settings, publicStatus: snapshot(state) } });
      }
      return route.fulfill({ json: { success: true, data: settings } });
    }
    if (path === '/api/sanctuary/admin/override') {
      const body = route.request().postDataJSON();
      expect(body.manualOverride).toBe('closed');
      state = 'closed';
      return route.fulfill({ json: { success: true, data: { ...settings, manualOverride: 'closed' }, publicStatus: snapshot(state) } });
    }
    return route.fulfill({ json: { success: true, data: [] } });
  });
  await page.goto('/admin/sanctuary-hours');
  const official = page.getByLabel('Confirm verified official schedule');
  await expect(official).not.toBeChecked();
  for (const day of days) {
    const label = day[0].toUpperCase() + day.slice(1);
    await expect(page.getByLabel(`${label} opening time`)).toHaveValue('');
    await page.getByLabel(`${label} opening time`).fill('10:15');
    await page.getByLabel(`${label} closing time`).fill('16:45');
  }
  await official.check();
  await page.getByLabel('Monday opening time').fill('10:30');
  await expect(official).not.toBeChecked();
  await official.check();
  const information = page.getByText('Enter verified official times', { exact: false });
  const contrast = await information.evaluate(element => {
    const c = getComputedStyle(element);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const luminance = color => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
    };
    const a = luminance(c.color), b = luminance(c.backgroundColor);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await information.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('sanctuary-admin-hours.png') });
  await page.getByRole('button', { name: 'Save opening hours' }).click();
  await expect(badge(page)).toContainText('Open Now');
  expect(saves).toBe(1);
  await expect(page.locator('select')).not.toContainText('Manually Open');
  await page.getByLabel('Visitor status').selectOption('closed');
  await page.getByRole('button', { name: 'Save manual status' }).click();
  await expect(badge(page)).toContainText('Closed Now');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('failed admin settings load disables saving instead of publishing defaults', async ({ page }) => {
  await stubStream(page);
  await page.addInitScript(() => localStorage.setItem('adminToken', 'fixture-admin-token'));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/admin/me') return route.fulfill({ json: { admin: { role: 'admin' } } });
    if (path === '/api/sanctuary/admin/settings') return route.fulfill({ status: 503, json: { success: false } });
    return route.fulfill({ json: { success: true, data: snapshot('unconfirmed') } });
  });
  await page.goto('/admin/sanctuary-hours');
  await expect(page.getByRole('button', { name: 'Save opening hours' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Reload settings' })).toBeVisible();
});
