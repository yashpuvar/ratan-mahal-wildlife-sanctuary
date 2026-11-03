// Read-only production browser audit. Never mocks APIs or submits forms.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { WILDLIFE_VIDEOS } from '../src/lib/wildlifeVideos.js';

const origin = process.argv[2] || 'https://ratan-mahal-wildlife-sanctuary-9fv5.vercel.app';
const browser = await chromium.launch();
const report = [];
try {
  for (const width of [320, 375, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 768, hasTouch: width < 768,
      ...(width < 768 ? { userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' } : {}) });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    for (const [path, selector, count] of [
      ['/posts', '#stories article img', 2],
      ['/gallery', '#gallery button[aria-label^="Open photograph:"] img', 12],
      ['/videos', '[aria-labelledby="wildlife-films-title"] article img', 4],
    ]) {
      const response = await page.goto(origin + path);
      assert.equal(response.status(), 200, path);
      const images = page.locator(selector);
      await images.nth(count - 1).waitFor();
      assert.equal(await images.count(), count);
      const results = [];
      for (const image of await images.all()) {
        await image.evaluate(img => img.scrollIntoView({ behavior: 'instant', block: 'center' }));
        await image.evaluate(img => Promise.race([
          img.decode(), new Promise((_, reject) => setTimeout(() => reject(new Error('Image decode timed out')), 15000)),
        ]));
        results.push(await image.evaluate(img => ({ src: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight })));
      }
      assert.ok(results.every(image => image.width > 0 && image.height > 0));
      if (path === '/posts' || path === '/gallery') {
        assert.ok(!results.some(image => new URL(image.src).hostname.endsWith('onrender.com') && new URL(image.src).pathname.startsWith('/images/')));
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      report.push({ width, path, images: results });
      console.log(JSON.stringify({ width, path, decodedImages: results.length }));
      if (path === '/videos' && width === 375) {
        for (const video of WILDLIFE_VIDEOS) {
          await page.getByRole('button', { name: `Play ${video.title}`, exact: true }).click();
          const dialog = page.getByRole('dialog');
          let playback;
          try {
            const frame = dialog.frameLocator('iframe');
            await frame.locator('.ytp-large-play-button').click({ timeout: 25000 });
            await frame.locator('video').evaluate(video => Promise.race([
              new Promise(resolve => {
                if (video.currentTime > 0) resolve();
                else video.addEventListener('timeupdate', () => { if (video.currentTime > 0) resolve(); });
              }), new Promise((_, reject) => setTimeout(() => reject(new Error('Playback did not advance')), 15000)),
            ]));
            playback = 'time advanced';
          } catch (error) { playback = `unverified: ${error.message.split('\n')[0]}`; }
          const result = { video: video.youtubeId, playback,
            iframe: await dialog.locator('iframe').count() ? await dialog.locator('iframe').getAttribute('src') : null,
            alert: await dialog.getByRole('alert').count() ? await dialog.getByRole('alert').textContent() : null };
          report.push(result);
          console.log(JSON.stringify(result));
          await dialog.getByRole('button', { name: 'Close video', exact: true }).click();
        }
      }
    }
    report.push({ width, consoleErrors: errors });
    await context.close();
  }
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
