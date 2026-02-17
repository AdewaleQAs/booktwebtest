import { test, expect } from '../../fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test.describe('Page Elements', () => {
    test('should display dashboard heading and subtitle', async ({ dashboardPage }) => {
      await dashboardPage.expectToBeOnDashboard();
    });

    test('should display all six module links', async ({ dashboardPage }) => {
      await dashboardPage.expectAllModulesVisible();
    });

    test('should display logo in the header', async ({ dashboardPage }) => {
      await expect(dashboardPage.logo).toBeVisible();
    });

    test('should display user menu with email', async ({ dashboardPage }) => {
      await expect(dashboardPage.userMenuButton).toBeVisible();
    });
  });

  test.describe('Events Module', () => {
    test('should navigate to events page', async ({ dashboardPage }) => {
      await dashboardPage.navigateToEvents();
    });

    test('should load events page with heading and tabs', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToEvents();
      await expect(page.getByRole('heading', { name: 'Events', level: 1 })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('tab', { name: 'All Events' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Active Events' })).toBeVisible();
    });

    test('should show create event link on events page', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToEvents();
      await expect(page.getByRole('link', { name: 'Create Event', exact: true })).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Check-In Module', () => {
    test('should navigate to check-in page', async ({ dashboardPage }) => {
      await dashboardPage.navigateToCheckIn();
    });

    test('should load check-in page with heading and live events', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToCheckIn();
      await expect(page.getByRole('heading', { name: 'Check-In', level: 1 })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Check in available live events')).toBeVisible();
    });

    test('should display guest list section on check-in page', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToCheckIn();
      await expect(page.getByRole('heading', { name: 'Guest List' })).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Activities Module', () => {
    test('should navigate to activities page', async ({ dashboardPage }) => {
      await dashboardPage.navigateToActivities();
    });

    test('should load activities page with heading and insights', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToActivities();
      await expect(page.getByRole('heading', { name: 'Activities', level: 1 })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible({ timeout: 10000 });
    });

    test('should display activity filter options', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToActivities();
      await expect(page.getByRole('radio', { name: 'Filter by All' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('radio', { name: 'Filter by Paid' })).toBeVisible();
      await expect(page.getByRole('radio', { name: 'Filter by Free' })).toBeVisible();
    });
  });

  test.describe('Earnings Module', () => {
    test('should navigate to earnings page', async ({ dashboardPage }) => {
      await dashboardPage.navigateToEarnings();
    });

    test('should load earnings page with heading and balance', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToEarnings();
      await expect(page.getByRole('heading', { name: 'Earnings', level: 1 })).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Available Balance', { exact: true })).toBeVisible({ timeout: 10000 });
    });

    test('should display cashout button on earnings page', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToEarnings();
      await expect(page.getByRole('button', { name: 'TAP TO CASH OUT' })).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Promotions Module', () => {
    test('should navigate to promotions page', async ({ dashboardPage }) => {
      await dashboardPage.navigateToPromotions();
    });

    test('should load promotions page with heading and generate button', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToPromotions();
      await expect(page.getByRole('heading', { name: 'Promotions', level: 1 })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Generate Promo Code' })).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Communications Module', () => {
    test('should navigate to communications page', async ({ dashboardPage }) => {
      await dashboardPage.navigateToCommunications();
    });

    test('should load communications page with heading and channel tabs', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToCommunications();
      await expect(page.getByRole('heading', { name: 'Communication', level: 1 })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Push', exact: true })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'SMS' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Email' })).toBeVisible();
    });
  });

  test.describe('Navigation Back to Dashboard', () => {
    test('should return to dashboard when clicking logo from events', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToEvents();
      await dashboardPage.logo.click();
      await dashboardPage.expectToBeOnDashboard();
    });
  });
});
