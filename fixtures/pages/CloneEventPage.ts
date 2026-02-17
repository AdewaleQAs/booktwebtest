import { Page, Locator, expect } from '@playwright/test';
import { CreateEventPage } from './CreateEventPage';

export class CloneEventPage extends CreateEventPage {
  // Override heading for clone page
  override readonly heading: Locator;

  // ---- Event Detail Page (for navigating to clone) ----
  readonly cloneEventLink: Locator;
  readonly viewTicketsLink: Locator;
  readonly viewGuestListLink: Locator;
  readonly endedBadge: Locator;

  constructor(page: Page) {
    super(page);

    // Override the heading to match "Clone Event" instead of "Create Event"
    this.heading = page.getByRole('heading', { name: 'Clone Event' });

    // Event detail page locators
    this.cloneEventLink = page.getByRole('link', { name: 'Clone Event' });
    this.viewTicketsLink = page.getByRole('link', { name: 'View Ticket(s)' });
    this.viewGuestListLink = page.getByRole('link', { name: 'View Guest List' });
    this.endedBadge = page.getByText('Ended').first();
  }

  // =====================================================================
  // Navigation
  // =====================================================================

  /** Navigate directly to the clone event page for a given event ID. */
  async goto(eventId: number) {
    await this.page.goto(`/events/clone-event/${eventId}?published=true`);
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    // Wait for data hydration — form fields populate after heading appears
    await expect(this.eventNameInput).not.toHaveValue('', { timeout: 10000 });
  }

  /** Navigate to the events list page. */
  async gotoEventsPage() {
    await this.page.goto('/events');
    await expect(this.page).toHaveURL(/\/events/, { timeout: 10000 });
  }

  /** Navigate to an event detail page. */
  async gotoEventDetail(eventId: number) {
    await this.page.goto(`/events/${eventId}?published=true`);
    // Wait for the page heading to appear (event name is an h1)
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 });
  }

  /** Click the "Clone Event" link on the event detail page. */
  async clickCloneEvent() {
    await this.cloneEventLink.click();
    await expect(this.heading).toBeVisible({ timeout: 15000 });
  }

  // =====================================================================
  // Assertions — Clone-specific
  // =====================================================================

  async expectToBeOnCloneEventPage() {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    await expect(this.page).toHaveURL(/\/events\/clone-event\//);
  }

  /** Verify that the event name input has a pre-filled value. */
  async expectEventNamePreFilled() {
    // Wait for data hydration — field may take a moment to populate
    await expect(this.eventNameInput).not.toHaveValue('', { timeout: 10000 });
  }

  /** Verify that the address input has a pre-filled value. */
  async expectAddressPreFilled() {
    await expect(this.addressInput).not.toHaveValue('', { timeout: 10000 });
  }

  /** Verify that the event about editor has pre-filled content. */
  async expectEventAboutPreFilled() {
    const text = await this.eventAboutEditor.textContent();
    expect(text && text.trim().length > 0).toBe(true);
  }

  /** Verify that the image upload area is empty (not pre-filled). */
  async expectImageNotPreFilled() {
    await expect(this.imageUploadArea).toBeVisible();
    await expect(this.imageValidationMessage).toBeVisible();
  }

  /** Verify that dates show placeholder text (not pre-filled). */
  async expectDatesNotPreFilled() {
    await expect(this.startDateButton).toBeVisible();
    await expect(this.endDateButton).toBeVisible();
    // The buttons should contain the placeholder text, not actual dates
    await expect(this.startDateButton).toContainText('Select start date');
    await expect(this.endDateButton).toContainText('Select end date');
  }
}
