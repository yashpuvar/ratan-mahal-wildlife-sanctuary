import { test, expect } from '@playwright/test';
import { DEMO_GALLERY } from '../../src/lib/galleryPhotos.js';

for (const width of [320, 375, 390, 768, 1440]) {
  test(`all 12 gallery images decode and lightbox works at ${width}px without IntersectionObserver`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => { window.IntersectionObserver = undefined; });
    await page.route('**/api/**', route => route.fulfill({ json: { success: true, data: [] } }));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/gallery');
    const cards = page.locator('#gallery button[aria-label^="Open photograph:"]');
    await expect(cards).toHaveCount(12);
    for (const photo of DEMO_GALLERY) {
      const card = page.getByRole('button', { name: `Open photograph: ${photo.title}`, exact: true });
      const image = card.locator('img');
      await image.evaluate(img => img.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(image).toHaveAttribute('src', photo.image);
      await expect(image).toBeVisible();
      const response = await page.request.get(photo.image);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('image/jpeg');
    }
    await cards.last().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('img')).toHaveAttribute('src', DEMO_GALLERY.at(-1).image);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('stored gallery content, backend visitor images, and local fallback remain usable', async ({ page }) => {
  await page.route('**/api/gallery', route => route.fulfill({ json: { success: true, data: [
    { _id: 'saved', title: 'Saved gallery photo', category: 'Wildlife', image: 'https://ratan-mahal-backend.onrender.com/images/bears/gallery/sloth-bear-daroji.jpg' },
    { _id: 'visitor', title: 'Approved visitor photo', category: 'Visitor Moments', image: '/api/gallery/visitor/image/visitor' },
    { _id: 'broken', title: 'Unavailable photo', category: 'Wildlife', image: 'https://cdn.example.invalid/missing.jpg' },
  ] } }));
  await page.route('**/api/gallery/visitor/image/visitor', route => route.fulfill({ path: 'public/images/bears/gallery/mother-cub-daroji.jpg', contentType: 'image/jpeg' }));
  await page.route('https://cdn.example.invalid/**', route => route.abort());
  await page.goto('/gallery');
  const cards = page.locator('#gallery button[aria-label^="Open photograph:"]');
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) {
    const image = card.locator('img');
    await image.evaluate(img => img.scrollIntoView({ behavior: 'instant' }));
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await expect(cards.filter({ hasText: 'Saved gallery photo' }).locator('img')).toHaveAttribute('src', '/images/bears/gallery/sloth-bear-daroji.jpg');
  await expect(cards.filter({ hasText: 'Approved visitor photo' }).locator('img')).toHaveAttribute('src', 'https://ratan-mahal-backend.onrender.com/api/gallery/visitor/image/visitor');
  await expect(cards.filter({ hasText: 'Unavailable photo' }).locator('img')).toHaveAttribute('src', DEMO_GALLERY[0].image);
});
