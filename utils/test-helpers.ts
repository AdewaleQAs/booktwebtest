import { Page } from '@playwright/test';

/**
 * Wait for network to be idle (no pending requests)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Clear browser storage (localStorage, sessionStorage, cookies)
 */
export async function clearBrowserStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  response: { status?: number; body?: unknown }
) {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status: response.status || 200,
      contentType: 'application/json',
      body: JSON.stringify(response.body || {}),
    });
  });
}

/**
 * Take a full page screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Wait for toast notification and verify its content
 */
export async function expectToast(page: Page, expectedText: string | RegExp) {
  const toast = page.locator('[data-state="open"][role="status"]');
  await toast.waitFor({ state: 'visible', timeout: 5000 });

  if (typeof expectedText === 'string') {
    await toast.filter({ hasText: expectedText }).waitFor();
  } else {
    await toast.filter({ hasText: expectedText }).waitFor();
  }
}

/**
 * Generate random test data
 */
export const testData = {
  email: () => `test-${Date.now()}@example.com`,
  phone: () => Math.floor(1000000000 + Math.random() * 9000000000).toString(),
  password: () => `Test${Date.now()}!`,
};