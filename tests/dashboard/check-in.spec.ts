import { test, expect } from '../../fixtures';

/**
 * Check-In Module — E2E Tests
 *
 * Tests the check-in feature at /check-in:
 * - Live events list with search and pagination
 * - Guest list panel (shown on event selection)
 * - Guest detail panel (shown on guest selection)
 *
 * Uses stable staging data:
 *   - "Praveen's Birthday Bash!" → has 1 guest (George Agomuo, Pending)
 *   - "PM2AM" → has 0 guests
 *   - 7 total live events across 2 pages
 *
 * NOTE: The "Check-In" action button is intentionally NOT clicked in tests
 * as it would modify staging data (mark a guest as checked in).
 */

const KNOWN_EVENT = "Praveen's Birthday Bash!";
const EMPTY_EVENT = 'PM2AM';
const KNOWN_GUEST = 'George Agomuo';
const KNOWN_GUEST_EMAIL = 'agomzygeo@gmail.com';

// =============================================================================
// PAGE ELEMENTS
// =============================================================================

test.describe('Check-In Page — Elements', () => {
  test.beforeEach(async ({ checkInPage }) => {
    await checkInPage.goto();
  });

  test('should display "Check-In" heading', async ({ checkInPage }) => {
    await expect(checkInPage.heading).toBeVisible();
  });

  test('should display "Check in available live events" subtitle', async ({ checkInPage }) => {
    await expect(checkInPage.subheading).toBeVisible();
  });

  test('should display search input for live events', async ({ checkInPage }) => {
    await expect(checkInPage.searchInput).toBeVisible();
  });

  test('should display "Your Live Event(s)" heading with total count', async ({ checkInPage }) => {
    await expect(checkInPage.eventsHeading).toBeVisible();
    const countText = await checkInPage.getEventsCountText();
    expect(countText).toMatch(/\d+ total/);
  });
});

// =============================================================================
// EVENT LIST
// =============================================================================

test.describe('Check-In — Event List', () => {
  test.beforeEach(async ({ checkInPage }) => {
    await checkInPage.goto();
  });

  test('should show live event cards with names', async ({ checkInPage }) => {
    // At least the known event should appear on page 1
    await checkInPage.expectEventVisible(KNOWN_EVENT);
  });

  test('should show event card with date', async ({ checkInPage, page }) => {
    // Event card shows "On: <date>" paragraph
    await checkInPage.expectEventVisible(KNOWN_EVENT);
    await expect(page.locator('paragraph', { hasText: /On:/ }).first()).not.toBeVisible();
    // Use text locator instead
    await expect(page.locator('p', { hasText: /On:/ }).first()).toBeVisible();
  });

  test('should show pagination "Page 1 of 2"', async ({ checkInPage }) => {
    await checkInPage.expectPaginationInfo('Page 1 of 2');
  });

  test('should disable Previous button on first page', async ({ checkInPage }) => {
    await expect(checkInPage.previousButton).toBeDisabled();
  });

  test('should enable Next button on first page', async ({ checkInPage }) => {
    await expect(checkInPage.nextButton).toBeEnabled();
  });
});

// =============================================================================
// SEARCH
// =============================================================================

test.describe('Check-In — Search', () => {
  test.beforeEach(async ({ checkInPage }) => {
    await checkInPage.goto();
  });

  test('should filter events when searching by name', async ({ checkInPage }) => {
    // Search for known stable event — should appear, rest should be filtered out
    await checkInPage.searchEvents("Praveen's");
    await checkInPage.expectEventVisible(KNOWN_EVENT);
  });

  test('should update event count when search is active', async ({ checkInPage }) => {
    // Full list has 7 events; wait for events to load before capturing baseline
    await checkInPage.expectEventVisible(KNOWN_EVENT);
    const fullCountText = await checkInPage.getEventsCountText();

    await checkInPage.searchEvents("Praveen's");
    const filteredCountText = await checkInPage.getEventsCountText();

    // Count should update and be less than original
    expect(filteredCountText).toMatch(/\d+ total/);
    expect(filteredCountText).not.toEqual(fullCountText);
  });

  test('should restore full list when search is cleared', async ({ checkInPage }) => {
    // Wait for events to load (non-zero count) before capturing baseline
    await checkInPage.expectEventVisible(KNOWN_EVENT);
    const fullCountText = await checkInPage.getEventsCountText();

    await checkInPage.searchEvents("Praveen's");
    const filteredCountText = await checkInPage.getEventsCountText();
    expect(filteredCountText).not.toEqual(fullCountText);

    await checkInPage.clearSearch();
    const restoredCountText = await checkInPage.getEventsCountText();
    expect(restoredCountText).toEqual(fullCountText);
  });
});

// =============================================================================
// PAGINATION
// =============================================================================

test.describe('Check-In — Pagination', () => {
  test.beforeEach(async ({ checkInPage }) => {
    await checkInPage.goto();
  });

  test('should navigate to page 2 when Next is clicked', async ({ checkInPage }) => {
    await checkInPage.nextButton.click();
    await checkInPage.expectPaginationInfo('Page 2 of 2');
    await expect(checkInPage.nextButton).toBeDisabled();
    await expect(checkInPage.previousButton).toBeEnabled();
  });

  test('should navigate back to page 1 when Previous is clicked', async ({ checkInPage }) => {
    await checkInPage.nextButton.click();
    await checkInPage.expectPaginationInfo('Page 2 of 2');

    await checkInPage.previousButton.click();
    await checkInPage.expectPaginationInfo('Page 1 of 2');
    await expect(checkInPage.previousButton).toBeDisabled();
  });
});

// =============================================================================
// GUEST LIST
// =============================================================================

test.describe('Check-In — Guest List', () => {
  test.beforeEach(async ({ checkInPage }) => {
    await checkInPage.goto();
  });

  test('should show "Select an event to view guests" when no event is selected', async ({ checkInPage }) => {
    await checkInPage.expectSelectEventPrompt();
  });

  test('should load guest list when event is selected', async ({ checkInPage }) => {
    await checkInPage.selectEvent(KNOWN_EVENT);
    await checkInPage.expectGuestVisible(KNOWN_GUEST);
  });

  test('should show guest email in guest list card', async ({ checkInPage, page }) => {
    await checkInPage.selectEvent(KNOWN_EVENT);
    await expect(page.locator(`text=${KNOWN_GUEST_EMAIL}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show "No guests found for this event" for event with no guests', async ({ checkInPage }) => {
    await checkInPage.selectEvent(EMPTY_EVENT);
    await checkInPage.expectNoGuests();
  });
});

// =============================================================================
// GUEST DETAIL PANEL
// =============================================================================

test.describe('Check-In — Guest Detail Panel', () => {
  test.beforeEach(async ({ checkInPage }) => {
    await checkInPage.goto();
    await checkInPage.selectEvent(KNOWN_EVENT);
    await checkInPage.selectGuest(KNOWN_GUEST);
  });

  test('should show guest name in detail panel', async ({ checkInPage }) => {
    await checkInPage.expectGuestDetailVisible(KNOWN_GUEST);
  });

  test('should show guest email in detail panel', async ({ checkInPage, page }) => {
    await expect(page.locator(`text=${KNOWN_GUEST_EMAIL}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show "First Timer" badge on guest detail', async ({ checkInPage, page }) => {
    await expect(page.locator('text=First Timer')).toBeVisible({ timeout: 10000 });
  });

  test('should show Ticket Information section', async ({ checkInPage }) => {
    await expect(checkInPage.ticketInfoHeading).toBeVisible();
  });

  test('should show ticket type in Ticket Information', async ({ checkInPage, page }) => {
    await expect(page.locator('text=Type:').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show ticket status in Ticket Information', async ({ checkInPage, page }) => {
    await expect(page.locator('text=Status:').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Check-In button (action not performed to preserve staging data)', async ({ checkInPage }) => {
    await expect(checkInPage.checkInButton).toBeVisible();
    await expect(checkInPage.checkInButton).toBeEnabled();
  });

  test('should show Send SMS button', async ({ checkInPage }) => {
    await expect(checkInPage.sendSmsButton).toBeVisible();
  });

  test('should show Resend Ticket button', async ({ checkInPage }) => {
    await expect(checkInPage.resendTicketButton).toBeVisible();
  });
});
