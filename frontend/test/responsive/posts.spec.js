import { test, expect } from '@playwright/test';

// References verified against existing RatanMahal.posts; no database writes.
const posts = [
  { _id: '6ae4657b506cb8dc7b77ac4b', title: 'A View Across the Forested Hills', image: '/images/posts/forested-hills-landscape.jpg', description: 'Forest view', isPublished: true },
  { _id: '6aca19f90049eab38302404f', title: 'Indian Bear (Gujarat)', image: 'https://images.pexels.com/photos/24589420/pexels-photo-24589420.jpeg', description: 'Indian bear', isPublished: true },
];

for (const width of [375, 1440]) {
  test(`both saved post images render on cards and detail at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/api/**', route => {
      const path = new URL(route.request().url()).pathname;
      const data = path === '/api/posts' ? posts : posts.find(post => path === `/api/posts/${post._id}`) || [];
      return route.fulfill({ json: { success: true, count: posts.length, data } });
    });
    await page.goto('/posts');
    const cards = page.locator('#stories article');
    await expect(cards).toHaveCount(2);
    for (const post of posts) {
      const image = cards.filter({ hasText: post.title }).locator('img');
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveAttribute('src', post.image);
      await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0), { timeout: 30000 }).toBe(true);
      await expect(image).toHaveAttribute('src', post.image);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const post of posts) {
      await page.goto(`/posts/${post._id}`);
      await expect(page.locator('main').getByRole('heading', { level: 1 })).toHaveText(post.title);
      const image = page.locator('main section').first().locator('img').first();
      await expect(image).toHaveAttribute('src', post.image);
      await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0), { timeout: 30000 }).toBe(true);
      await expect(image).toHaveAttribute('src', post.image);
    }
  });
}
