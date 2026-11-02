import { test, expect } from '@playwright/test';

for (const width of [320, 375, 390, 430, 768, 1440]) {
  test(`wildlife actually paints at ${width}px`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      isMobile: width < 768,
      hasTouch: width < 768,
      deviceScaleFactor: width < 768 ? 3 : 1,
    });
    const page = await context.newPage();
    // Keep this visual regression independent of backend availability; no writes.
    await page.route('**/api/**', route => route.fulfill({ json: { data: [] } }));
    const responses = [];
    page.on('response', response => {
      if (response.url().endsWith('/images/bears/gallery/sloth-bear-ranthambore.jpg')) responses.push(response);
    });
    await page.goto('/');
    const hero = page.locator('.homepage-hero');
    const image = hero.locator('img');
    await image.evaluate(img => img.decode());
    await page.waitForTimeout(700);
    await page.addStyleTag({ content: '.animate-cinematic { animation: none !important; }' });
    expect(await image.evaluate(img => [img.naturalWidth, img.naturalHeight])).toEqual([1280, 853]);
    expect(responses).toHaveLength(1);
    expect(responses[0].status()).toBe(200);
    expect(responses[0].headers()['content-type']).toContain('image/jpeg');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(hero.getByRole('link', { name: 'Explore Sanctuary' })).toBeVisible();

    if (width < 768) {
      // The face landmark in the original photo must remain inside the crop,
      // above the badge, instead of disappearing off the right of a tall hero.
      const face = await image.evaluate(img => {
        const box = img.getBoundingClientRect();
        const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
        return {
          x: box.x + (box.width - img.naturalWidth * scale) * 0.62 + 800 * scale,
          y: box.y + (box.height - img.naturalHeight * scale) * 0.5 + 450 * scale,
        };
      });
      expect(face.x).toBeGreaterThan(0);
      expect(face.x).toBeLessThan(width);
      expect(face.y).toBeLessThan((await hero.locator('.homepage-hero__content').locator('p').first().boundingBox()).y);
    }

    const bounds = await hero.boundingBox();
    const clip = { x: 0, y: bounds.y + 15, width, height: 170 };
    const visible = await page.screenshot({ clip });
    await image.evaluate(img => { img.style.visibility = 'hidden'; });
    const hidden = await page.screenshot({ clip });
    // Compare actual rendered RGB pixels, including overlays, with/without the
    // photo. A decoded but fully covered image must fail this assertion.
    const paintedRatio = await page.evaluate(async ([first, second]) => {
      const pixels = async data => {
        const img = new Image();
        img.src = `data:image/png;base64,${data}`;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const a = await pixels(first); const b = await pixels(second);
      let changed = 0;
      for (let i = 0; i < a.length; i += 4) {
        if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 15) changed++;
      }
      return changed / (a.length / 4);
    }, [visible.toString('base64'), hidden.toString('base64')]);
    expect(paintedRatio).toBeGreaterThan(width < 768 ? 0.8 : 0.1);
    await image.evaluate(img => { img.style.visibility = ''; });
    await hero.screenshot({ path: testInfo.outputPath(`hero-${width}.png`) });
    await context.close();
  });
}
