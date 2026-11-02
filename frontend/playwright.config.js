import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/responsive',
  fullyParallel: true,
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4175' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4175 --strictPort',
    url: 'http://127.0.0.1:4175',
  },
});
