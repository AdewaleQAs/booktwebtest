import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // Auth setup — runs first to create shared auth state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: './fixtures',
    },

    // Unauthenticated tests (sign-in, sign-up)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /dashboard/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /dashboard/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /dashboard/,
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: /dashboard/,
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: /dashboard/,
    },

    // Authenticated tests (dashboard, modules)
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      testMatch: /dashboard/,
      dependencies: ['setup'],
    },
  ],
});
