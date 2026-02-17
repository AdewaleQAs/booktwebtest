import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '..', '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/sign-in');

  const email = process.env.TEST_USER_EMAIL || 't.adewale@getbookt.io';
  const password = process.env.TEST_USER_PASSWORD || 'Damilare@26';

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for the success overlay and redirect to dashboard
  await expect(page.getByRole('heading', { name: 'Success!' })).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveURL(/\.io\/$/, { timeout: 15000 });

  // Save auth state
  await page.context().storageState({ path: authFile });
});
