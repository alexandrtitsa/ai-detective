import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${String(PORT)}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI && { workers: 2 }),
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    locale: 'uk-UA',
    trace: 'on-first-retry',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `${isCI ? '' : 'npm run build && '}npm run preview -- --host 127.0.0.1 --port ${String(PORT)} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});