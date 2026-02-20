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
  readonly alreadyCheckedInButton: Locator;
  readonly sendSmsButton: Locator;
  readonly resendTicketButton: Locator;
  readonly ticketInfoHeading: Locator;

  // ---- Check-In Confirmation Dialog ----
  readonly checkInDialog: Locator;
  readonly checkInDialogHeading: Locator;
  readonly checkInDialogConfirmButton: Locator;
  readonly checkInDialogCancelButton: Locator;

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
    this.alreadyCheckedInButton = page.getByRole('button', { name: 'Already Checked In' });
    this.sendSmsButton = page.getByRole('button', { name: 'Send SMS' });
    this.resendTicketButton = page.getByRole('button', { name: 'Resend Ticket' });
    this.ticketInfoHeading = page.getByRole('heading', { name: 'Ticket Information' });

    // ---- Check-In Confirmation Dialog ----
    this.checkInDialog = page.getByRole('dialog', { name: 'Check-In Tickets' });
    this.checkInDialogHeading = page.getByRole('heading', { name: 'Check-In Tickets', level: 2 });
    this.checkInDialogConfirmButton = page.getByRole('button', { name: /Check-In \d+ Ticket/ });
    this.checkInDialogCancelButton = page.getByRole('button', { name: 'Cancel' });
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

  /** Type into the search input. Callers should follow with an assertion that auto-waits. */
  async searchEvents(query: string) {
    await this.searchInput.fill(query);
  }

  /** Clear the search input. Callers should follow with an assertion that auto-waits. */
  async clearSearch() {
    await this.searchInput.clear();
  }

  /** Click an event card by its heading name and wait for guest list to load. */
  async selectEvent(name: string) {
    await this.page.getByRole('heading', { name, level: 3 }).click();
    await expect(this.guestListHeading).toBeVisible({ timeout: 10000 });
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
    await expect(this.ticketInfoHeading).toBeVisible({ timeout: 10000 });
  }

  // =====================================================================
  // Guest Discovery
  // =====================================================================

  /**
   * Page through the guest list and find the first guest that is NOT yet
   * checked in (i.e. the "Check-In" button is visible in the detail panel).
   *
   * Returns the guest's display name, or `null` if every guest across all
   * pages has already been checked in.
   */
  async findUncheckedGuest(): Promise<string | null> {
    for (let pageNum = 0; pageNum < 10; pageNum++) {
      // Guest cards contain an email paragraph (with "@"), unlike event cards
      const guestCards = this.page.locator('[class*="cursor-pointer"]')
        .filter({ has: this.page.locator('h3') })
        .filter({ has: this.page.locator('p', { hasText: /@/ }) });

      const count = await guestCards.count();

      for (let i = 0; i < count; i++) {
        const card = guestCards.nth(i);
        const name = (await card.locator('h3').textContent())?.trim() ?? '';

        await card.click();
        await expect(this.ticketInfoHeading).toBeVisible({ timeout: 10000 });

        if (await this.checkInButton.isVisible()) {
          return name;
        }
      }

      // Move to the next page of guests (if available)
      const nextEnabled = await this.guestNextButton.isEnabled();
      if (!nextEnabled) break;

      const currentPageText = await this.page.locator('text=/Page \\d+ of \\d+/').nth(1).textContent();
      await this.guestNextButton.click();
      // Wait for page text to change, confirming the new page loaded
      await expect(this.page.locator('text=/Page \\d+ of \\d+/').nth(1)).not.toHaveText(currentPageText ?? '', { timeout: 5000 });
    }

    return null;
  }

  // =====================================================================
  // Check-In Actions
  // =====================================================================

  /**
   * Click the Check-In button, confirm in the dialog, and wait for the success toast.
   * Returns after the toast "Checked in <name>" appears.
   */
  async performCheckIn(guestName: string) {
    await this.checkInButton.click();
    await expect(this.checkInDialog).toBeVisible({ timeout: 5000 });
    await this.checkInDialogConfirmButton.click();
    await expect(this.page.locator('text=Checked in ' + guestName)).toBeVisible({ timeout: 10000 });
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
