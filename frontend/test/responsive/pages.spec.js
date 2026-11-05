import { test, expect } from '@playwright/test';

// Mocked APIs keep all browser checks independent of production data.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/sanctuary/events') return route.fulfill({ contentType: 'text/event-stream', body: 'retry: 60000\n\n' });
    const json = path === '/api/admin/me' ? { admin: { role: 'admin', name: 'Fixture Admin' } }
      : path.endsWith('/hotel-status') ? { success: true, data: { open: true } }
      : { success: true, data: [] };
    return route.fulfill({ json });
  });
});
for (const path of ['/gallery', '/posts', '/stay', '/contact', '/login', '/admin/login']) {
  test(`mobile page ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    if (path === '/stay') {
      const image = page.locator('img[src*="/images/hotel/"]').first();
      await image.evaluate(img => img.decode());
      expect(await image.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
    }
  });
}
test('visitor upload preview and reset', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('token', 'fixture-user-token'));
  await page.goto('/gallery');
  await page.getByRole('button', { name: /Share Your Wildlife Moments/ }).click();
  await page.getByLabel('Your display name').fill('Fixture Visitor');
  await page.getByLabel('Photo title').fill('Fixture photograph');
  await page.locator('input[type=file]').setInputFiles('public/images/bears/gallery/sloth-bear-ranthambore.jpg');
  await expect(page.getByAltText('Selected photo preview')).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit for Admin Approval' }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('submitted successfully');
  await expect(page.getByAltText('Selected photo preview')).toHaveCount(0);
  expect(await page.locator('input[type=file]').inputValue()).toBe('');
});
test('admin dashboard and pending photos', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('adminToken', 'fixture-admin-token'));
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /Dashboard/i }).first()).toBeVisible();
  await page.goto('/admin/visitor-photos');
  await expect(page.getByText('No pending visitor photo submissions.')).toBeVisible();
});
