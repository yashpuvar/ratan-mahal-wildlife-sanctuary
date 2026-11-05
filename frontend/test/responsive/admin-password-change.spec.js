import { test, expect } from '@playwright/test';

for (const width of [375, 1440]) {
  test(`temporary login requires password change before dashboard at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    let pending = true;
    let changeRequests = 0;
    const adminDataRequests = [];
    await page.route('**/api/**', async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      const identity = { id: 'fixture-id', name: 'Fixture Admin', email: 'owner@example.test', role: 'admin', mustChangePassword: pending };
      if (path === '/api/admin/login') return route.fulfill({ json: { success: true, token: 'fixture-restricted-token', admin: identity } });
      if (path === '/api/admin/me') return route.fulfill({ json: { success: true, admin: identity } });
      if (path === '/api/admin/change-password') {
        changeRequests++;
        expect(request.headers().authorization).toBe('Bearer fixture-restricted-token');
        expect(request.postDataJSON()).toEqual({ currentPassword: 'Fixture-only-temp-123', newPassword: 'Fixture-only-permanent-456' });
        pending = false;
        return route.fulfill({ json: { success: true, token: 'fixture-normal-token', admin: { ...identity, mustChangePassword: false } } });
      }
      if (['/api/posts', '/api/contacts', '/api/gallery', '/api/videos', '/api/bookings'].includes(path)) adminDataRequests.push(path);
      return route.fulfill({ json: { success: true, data: [] } });
    });
    await page.goto('/admin/login');
    await page.getByLabel('Admin Email').fill('owner@example.test');
    await page.getByLabel('Password', { exact: true }).fill('Fixture-only-temp-123');
    await page.getByRole('button', { name: 'Sign In to Dashboard' }).click();
    await expect(page).toHaveURL(/\/admin\/change-password$/);
    await expect(page.getByLabel('Temporary password', { exact: true })).toBeVisible();
    await page.goto('/admin/posts');
    await expect(page).toHaveURL(/\/admin\/change-password$/);
    expect(adminDataRequests).toEqual([]);
    await page.getByLabel('Temporary password', { exact: true }).fill('Fixture-only-temp-123');
    await page.getByLabel('New password', { exact: true }).fill('Fixture-only-permanent-456');
    await page.getByLabel('Repeat new password', { exact: true }).fill('Mismatched-fixture-123');
    await page.getByRole('button', { name: 'Set password and open dashboard' }).click();
    await expect(page.getByRole('alert')).toContainText('do not match');
    expect(changeRequests).toBe(0);
    await page.getByLabel('Repeat new password', { exact: true }).fill('Fixture-only-permanent-456');
    await page.getByRole('button', { name: 'Set password and open dashboard' }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: /Dashboard/ }).first()).toBeVisible();
    expect(changeRequests).toBe(1);
    expect(await page.evaluate(() => localStorage.getItem('adminToken'))).toBe('fixture-normal-token');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('Fixture-only-permanent-456');
  });
}

test('anonymous visitor cannot open the admin password-change form', async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ json: { success: true, data: [] } }));
  await page.goto('/admin/change-password');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('button', { name: 'Sign In to Dashboard' })).toBeVisible();
});
