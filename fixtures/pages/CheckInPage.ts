import { Page, Locator, expect } from '@playwright/test';

export class CheckInPage {
  readonly page: Page;

  // ---- Page Header ----
  readonly heading: Locator;
  readonly subheading: Locator;
  readonly homeButton: Locator;

  // ---- Event List Panel ----
  readonly liveEventsButton: Locator;
  readonly searchInput: Locator;
  readonly eventsHeading: Locator;
  readonly previousButton: Locator;  // event list Previous (nth 0)
  readonly nextButton: Locator;       // event list Next (nth 0)

  // ---- Guest List Panel ----
  readonly guestListHeading: Locator;
  readonly noGuestsText: Locator;
  readonly selectEventText: Locator;
  readonly guestPreviousButton: Locator; // guest list Previous (nth 1)
  readonly guestNextButton: Locator;     // guest list Next (nth 1)

  // ---- Guest Detail Panel ----
  readonly checkInButton: Locator;
  readonly sendSmsButton: Locator;
  readonly resendTicketButton: Locator;
  readonly ticketInfoHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // ---- Page Header ----
    this.heading = page.getByRole('heading', { name: 'Check-In', level: 1 });
    this.subheading = page.locator('text=Check in available live events');
    this.homeButton = page.getByRole('button', { name: 'Home' });

    // ---- Event List Panel ----
    this.liveEventsButton = page.getByRole('button', { name: 'Live Events' });
    this.searchInput = page.getByRole('textbox', { name: 'Search live events...' });
    this.eventsHeading = page.getByRole('heading', { level: 2 }).filter({ hasText: /Your Live Event/ });
    this.previousButton = page.getByRole('button', { name: 'Previous' }).nth(0);
    this.nextButton = page.getByRole('button', { name: 'Next' }).nth(0);

    // ---- Guest List Panel ----
    this.guestListHeading = page.getByRole('heading', { name: 'Guest List' });
    this.noGuestsText = page.locator('text=No guests found for this event');
    this.selectEventText = page.locator('text=Select an event to view guests');
    this.guestPreviousButton = page.getByRole('button', { name: 'Previous' }).nth(1);
    this.guestNextButton = page.getByRole('button', { name: 'Next' }).nth(1);

    // ---- Guest Detail Panel ----
    this.checkInButton = page.getByRole('button', { name: 'Check-In' });
    this.sendSmsButton = page.getByRole('button', { name: 'Send SMS' });
    this.resendTicketButton = page.getByRole('button', { name: 'Resend Ticket' });
    this.ticketInfoHeading = page.getByRole('heading', { name: 'Ticket Information' });
  }

  // =====================================================================
  // Navigation
  // =====================================================================

  /** Navigate to the check-in page and wait for heading. */
  async goto() {
    await this.page.goto('/check-in');
    await expect(this.heading).toBeVisible({ timeout: 15000 });
  }

  // =====================================================================
  // Event List Interactions
  // =====================================================================

  /** Type into the search input and wait for results to update. */
  async searchEvents(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(1000);
  }

  /** Clear the search input and wait for full list to restore. */
  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(1000);
  }

  /** Click an event card by its heading name. */
  async selectEvent(name: string) {
    await this.page.getByRole('heading', { name, level: 3 }).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Search for an event by query, wait for it to appear, then click it.
   * Clicking an event card clears the search and restores the full event list.
   */
  async searchAndSelectEvent(searchTerm: string, eventName: string) {
    await this.searchEvents(searchTerm);
    await this.expectEventVisible(eventName);
    await this.selectEvent(eventName);
  }

  /**
   * Get the total events count text from the heading.
   * The heading looks like "Your Live Event(s)(7 total)" — returns e.g. "(7 total)"
   */
  async getEventsCountText(): Promise<string> {
    const headingText = await this.eventsHeading.textContent();
    return headingText ?? '';
  }

  // =====================================================================
  // Guest Interactions
  // =====================================================================

  /** Click a guest card by the guest's name (uses first match to handle duplicate names). */
  async selectGuest(name: string) {
    await this.page.getByRole('heading', { name, level: 3 }).first().click();
    await this.page.waitForTimeout(500);
  }

  // =====================================================================
  // Assertions
  // =====================================================================

  /** Assert an event card with the given name is visible. */
  async expectEventVisible(name: string) {
    await expect(this.page.getByRole('heading', { name, level: 3 })).toBeVisible({ timeout: 10000 });
  }

  /** Assert an event card with the given name is NOT visible. */
  async expectEventNotVisible(name: string) {
    await expect(this.page.getByRole('heading', { name, level: 3 })).not.toBeVisible({ timeout: 10000 });
  }

  /** Assert a guest card with the given name is visible in the guest list (uses first match). */
  async expectGuestVisible(name: string) {
    await expect(this.page.getByRole('heading', { name, level: 3 }).first()).toBeVisible({ timeout: 10000 });
  }

  /** Assert the guest detail panel is showing the given guest's name. */
  async expectGuestDetailVisible(name: string) {
    await expect(this.page.getByRole('heading', { name, level: 2 })).toBeVisible({ timeout: 10000 });
  }

  /** Assert the "Select an event to view guests" prompt is visible. */
  async expectSelectEventPrompt() {
    await expect(this.selectEventText).toBeVisible({ timeout: 10000 });
  }

  /** Assert "No guests found for this event" message is visible. */
  async expectNoGuests() {
    await expect(this.noGuestsText).toBeVisible({ timeout: 10000 });
  }

  /** Assert the pagination info text e.g. "Page 1 of 2" is visible. */
  async expectPaginationInfo(text: string) {
    await expect(this.page.locator(`text=${text}`)).toBeVisible({ timeout: 10000 });
  }
}
