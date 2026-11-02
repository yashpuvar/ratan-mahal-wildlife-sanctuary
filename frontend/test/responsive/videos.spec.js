import { test, expect } from '@playwright/test';
import { WILDLIFE_VIDEOS } from '../../src/lib/wildlifeVideos.js';

async function mockApi(page, records = []) {
  await page.route('**/api/**', route => route.fulfill({ json: { success: true, data: records } }));
}

for (const width of [320, 375, 768, 1440]) {
  test(`wildlife films load alongside published videos at ${width}px without loading players`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockApi(page, [{ _id: 'existing-video', title: 'Existing sanctuary film', youtubeId: 'existing123', category: 'Sanctuary' }]);
    const playerRequests = [];
    page.on('request', request => { if (/youtube.*(?:embed|iframe_api)/.test(request.url())) playerRequests.push(request.url()); });
    await page.goto('/videos');
    await expect(page.getByRole('button', { name: 'Play Existing sanctuary film', exact: true })).toBeVisible();
    const collection = page.getByRole('region', { name: 'Small Moments. Wild Lives.' });
    await expect(collection.locator('article')).toHaveCount(4);
    for (const video of WILDLIFE_VIDEOS) {
      await expect(collection.getByRole('button', { name: `Play ${video.title}`, exact: true })).toBeVisible();
      await expect(collection.locator(`img[src="${video.poster}"]`)).toHaveAttribute('loading', 'lazy');
      await expect(collection.locator(`a[href="${video.source}"]`)).toHaveCount(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('iframe, video')).toHaveCount(0);
    expect(playerRequests).toEqual([]);
  });
}

test('selection creates one privacy player, supports failure recovery and keyboard dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await mockApi(page);
  await page.addInitScript(() => {
    window.YT = { Player: class {
      constructor(mount, options) {
        this.iframe = document.createElement('iframe');
        this.iframe.width = options.width;
        this.iframe.height = options.height;
        this.iframe.src = `${options.host}/embed/${options.videoId}?autoplay=${options.playerVars.autoplay}`;
        mount.replaceWith(this.iframe);
        window.failTestPlayer = () => options.events.onError({ data: 150 });
        setTimeout(() => options.events.onReady({ target: this }), 0);
      }
      getIframe() { return this.iframe; }
      destroy() { this.iframe.remove(); }
    } };
  });
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ body: '<html><body>Fixture player</body></html>', contentType: 'text/html' }));
  await page.goto('/videos');
  const button = page.getByRole('button', { name: `Play ${WILDLIFE_VIDEOS[0].title}`, exact: true });
  await button.click();
  const dialog = page.getByRole('dialog');
  const iframe = dialog.locator('iframe');
  await expect(iframe).toHaveCount(1);
  await expect(iframe).toHaveAttribute('src', /youtube-nocookie.com\/embed\/7DB1MdR_BiY\?autoplay=0/);
  await expect(iframe).toHaveAttribute('allowfullscreen', '');
  const bounds = await iframe.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(900);
  expect(bounds.height).toBeGreaterThanOrEqual(200);
  await expect(dialog.getByRole('button', { name: 'Close video', exact: true })).toBeFocused();
  await page.evaluate(() => window.failTestPlayer());
  await expect(dialog.getByRole('alert')).toContainText('unavailable');
  await expect(dialog.getByRole('link', { name: /Watch original video/ })).toHaveAttribute('href', WILDLIFE_VIDEOS[0].source);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(button).toBeFocused();
});

test('curated films and original collection remain usable when the API and player script fail', async ({ page }) => {
  await page.route('**/api/**', route => route.abort());
  await page.route('https://www.youtube.com/iframe_api', route => route.abort());
  await page.goto('/videos');
  await expect(page.getByRole('button', { name: 'Play Sloth Bears Exploring Their Habitat', exact: true })).toBeVisible();
  await page.getByRole('button', { name: `Play ${WILDLIFE_VIDEOS[3].title}`, exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('unavailable');
  await expect(page.getByRole('dialog').getByRole('link', { name: /Watch original video/ })).toHaveAttribute('href', WILDLIFE_VIDEOS[3].source);
});
