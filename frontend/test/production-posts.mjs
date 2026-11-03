// Read-only smoke test against the real deployment. No mocked API or database writes.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const failures = [];
  page.on('requestfailed', request => {
    if (request.url().includes('/api/posts')) failures.push({ url: request.url(), error: request.failure()?.errorText });
  });
  const responsePromise = page.waitForResponse(response => response.url() === 'https://ratan-mahal-backend.onrender.com/api/posts', { timeout: 90000 });
  await page.goto('https://ratan-mahal-wildlife-sanctuary-9fv5.vercel.app/posts');
  const response = await responsePromise;
  const body = await response.json();
  console.log(JSON.stringify({ url: response.url(), status: response.status(), allowOrigin: response.headers()['access-control-allow-origin'], body, failures }));
  assert.equal(response.status(), 200);
  assert.equal(body.success, true);
  assert.equal(body.count, 2);
  await page.locator('#stories article').nth(1).waitFor({ timeout: 15000 });
  assert.equal(await page.locator('#stories article').count(), 2);
  for (const post of body.data) assert.ok(await page.locator('#stories').getByRole('heading', { name: post.title, exact: true }).isVisible());
  console.log('Production Posts page displays both MongoDB stories.');
} finally {
  await browser.close();
}
