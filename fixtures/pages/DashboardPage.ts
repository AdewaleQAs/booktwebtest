import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  // Dashboard locators
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly logo: Locator;
  readonly userMenuButton: Locator;

  // Module links
  readonly eventsLink: Locator;
  readonly checkInLink: Locator;
  readonly activitiesLink: Locator;
  readonly earningsLink: Locator;
  readonly promotionsLink: Locator;
  readonly communicationsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dashboard
    this.heading = page.getByRole('heading', { name: 'Hi there,' });
    this.subtitle = page.locator('text=What do you want to do?');
    this.logo = page.getByRole('link', { name: 'logo' });
    this.userMenuButton = page.locator('button', { hasText: /@/ });

    // Module links
    this.eventsLink = page.getByRole('link', { name: /EVENTS/i });
    this.checkInLink = page.getByRole('link', { name: /Check-In/i });
    this.activitiesLink = page.getByRole('link', { name: /Activities/i });
    this.earningsLink = page.getByRole('link', { name: /Earnings/i });
    this.promotionsLink = page.getByRole('link', { name: /Promotions/i });
    this.communicationsLink = page.getByRole('link', { name: /Communications/i });
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.heading).toBeVisible({ timeout: 15000 });
  }

  async expectToBeOnDashboard() {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    await expect(this.subtitle).toBeVisible();
  }

  async expectAllModulesVisible() {
    await expect(this.eventsLink).toBeVisible();
    await expect(this.checkInLink).toBeVisible();
    await expect(this.activitiesLink).toBeVisible();
    await expect(this.earningsLink).toBeVisible();
    await expect(this.promotionsLink).toBeVisible();
    await expect(this.communicationsLink).toBeVisible();
  }

  async navigateToEvents() {
    await this.eventsLink.click();
    await expect(this.page).toHaveURL(/\/events/, { timeout: 10000 });
  }

  async navigateToCheckIn() {
    await this.checkInLink.click();
    await expect(this.page).toHaveURL(/\/check-in/, { timeout: 10000 });
  }

  async navigateToActivities() {
    await this.activitiesLink.click();
    await expect(this.page).toHaveURL(/\/activities/, { timeout: 10000 });
  }

  async navigateToEarnings() {
    await this.earningsLink.click();
    await expect(this.page).toHaveURL(/\/earnings/, { timeout: 10000 });
  }

  async navigateToPromotions() {
    await this.promotionsLink.click();
    await expect(this.page).toHaveURL(/\/promotions/, { timeout: 10000 });
  }

  async navigateToCommunications() {
    await this.communicationsLink.click();
    await expect(this.page).toHaveURL(/\/communications/, { timeout: 10000 });
  }
}
