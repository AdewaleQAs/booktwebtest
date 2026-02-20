import { test, expect } from '../../fixtures';

/**
 * Check-In Module — E2E Tests
 *
 * Tests the check-in feature at /check-in:
 * - Live events list with search and pagination
 * - Guest list panel (shown on event selection)
 * - Guest detail panel (shown on guest selection)
 * - Check-in action (dialog, confirmation, success state)
 *
 * Uses stable staging data:
 *   - Search "apollo" → "Apollo Wrldx Presents: ACTIV3 by DJ YB" (50 guests)
 *   - "PM2AM" → has 0 guests
 *
 * Key UX behaviour: clicking an event card clears the search input and
 * restores the full event list.
 *
 * The Check-In Action tests dynamically find an unchecked guest by paging
 * through the guest list, so they remain idempotent across repeated runs.
 */

const APOLLO_SEARCH = 'apollo';
const KNOWN_EVENT = 'Apollo Wrldx Presents: ACTIV3 by DJ YB';
const EMPTY_EVENT = 'PM2AM';
const KNOWN_GUEST = 'Princi Ja';
const KNOWN_GUEST_EMAIL = 'princi.j@cisinlabs.com';

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

  test('should show event card with date', async ({ checkInPage, page }) => {
    await expect(page.locator('p', { hasText: /On:/ }).first()).toBeVisible();
  });

  test('should show pagination info on first page', async ({ checkInPage }) => {
    await expect(checkInPage.page.locator('text=/Page 1 of \\d+/')).toBeVisible({ timeout: 10000 });
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
    await checkInPage.searchEvents(APOLLO_SEARCH);
    await checkInPage.expectEventVisible(KNOWN_EVENT);
    const countText = await checkInPage.getEventsCountText();
    expect(countText).toContain('1 total');
  });

  test('should update event count when search is active', async ({ checkInPage }) => {
    // Search and confirm filtered count is exactly 1
    await checkInPage.searchEvents(APOLLO_SEARCH);
    await checkInPage.expectEventVisible(KNOWN_EVENT);
    const filteredCountText = await checkInPage.getEventsCountText();
    expect(filteredCountText).toContain('1 total');
  });

  test('should restore full list when search is cleared', async ({ checkInPage, page }) => {
    // Wait for events to load, then capture baseline count
    await expect(page.locator('text=/[1-9]\\d* total/')).toBeVisible({ timeout: 10000 });
    const baselineCount = await checkInPage.getEventsCountText();

    await checkInPage.searchEvents(APOLLO_SEARCH);
    await checkInPage.expectEventVisible(KNOWN_EVENT);
    const filteredCountText = await checkInPage.getEventsCountText();
    expect(filteredCountText).toContain('1 total');

    await checkInPage.clearSearch();
    const restoredCountText = await checkInPage.getEventsCountText();
    expect(restoredCountText).toBe(baselineCount);
  });

  test('should clear search and restore full list when event card is clicked', async ({ checkInPage, page }) => {
    // Wait for events to load, then capture baseline count
    await expect(page.locator('text=/[1-9]\\d* total/')).toBeVisible({ timeout: 10000 });
    const baselineCount = await checkInPage.getEventsCountText();

    await checkInPage.searchEvents(APOLLO_SEARCH);
    await checkInPage.expectEventVisible(KNOWN_EVENT);
    expect(await checkInPage.getEventsCountText()).toContain('1 total');

    // Clicking the event card clears the search and restores all events
    await checkInPage.selectEvent(KNOWN_EVENT);

    await expect(checkInPage.searchInput).toHaveValue('');
    const restoredCountText = await checkInPage.getEventsCountText();
    expect(restoredCountText).toBe(baselineCount);
  });
});

// =============================================================================
// PAGINATION
// =============================================================================

test.describe('Check-In — Pagination', () => {
  test.beforeEach(async ({ checkInPage }) => {
    await checkInPage.goto();
  });

  test('should navigate to next page when Next is clicked', async ({ checkInPage }) => {
    await checkInPage.nextButton.click();
    await expect(checkInPage.page.locator('text=/Page 2 of \\d+/')).toBeVisible({ timeout: 10000 });
    await expect(checkInPage.previousButton).toBeEnabled();
  });

  test('should navigate back to page 1 when Previous is clicked', async ({ checkInPage }) => {
    await checkInPage.nextButton.click();
    await expect(checkInPage.page.locator('text=/Page 2 of \\d+/')).toBeVisible({ timeout: 10000 });

    await checkInPage.previousButton.click();
    await expect(checkInPage.page.locator('text=/Page 1 of \\d+/')).toBeVisible({ timeout: 10000 });
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

  test('should load guest list when event is selected via search', async ({ checkInPage }) => {
    await checkInPage.searchAndSelectEvent(APOLLO_SEARCH, KNOWN_EVENT);
    await checkInPage.expectGuestVisible(KNOWN_GUEST);
  });

  test('should show guest email in guest list card', async ({ checkInPage, page }) => {
    await checkInPage.searchAndSelectEvent(APOLLO_SEARCH, KNOWN_EVENT);
    await expect(page.locator(`text=${KNOWN_GUEST_EMAIL}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show ticket count on guest list card', async ({ checkInPage, page }) => {
    await checkInPage.searchAndSelectEvent(APOLLO_SEARCH, KNOWN_EVENT);
    await expect(page.locator('p', { hasText: /\d+ Ticket/ }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show guest list pagination for event with many guests', async ({ checkInPage }) => {
    await checkInPage.searchAndSelectEvent(APOLLO_SEARCH, KNOWN_EVENT);
    // Apollo has many guests — verify pagination is present
    await expect(checkInPage.page.locator('text=/Page 1 of \\d+/').nth(1)).toBeVisible({ timeout: 10000 });
    await expect(checkInPage.guestNextButton).toBeEnabled();
    await expect(checkInPage.guestPreviousButton).toBeDisabled();
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
    await checkInPage.searchAndSelectEvent(APOLLO_SEARCH, KNOWN_EVENT);
    await checkInPage.selectGuest(KNOWN_GUEST);
  });

  test('should show guest name in detail panel', async ({ checkInPage }) => {
    await checkInPage.expectGuestDetailVisible(KNOWN_GUEST);
  });

  test('should show guest email in detail panel', async ({ checkInPage, page }) => {
    await expect(page.locator(`text=${KNOWN_GUEST_EMAIL}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show "Repeat Customer" badge on guest detail', async ({ checkInPage, page }) => {
    await expect(page.locator('text=Repeat Customer')).toBeVisible({ timeout: 10000 });
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

  test('should show Check-In or Already Checked In button', async ({ checkInPage }) => {
    // Guest may already be checked in from a prior run — either state is valid
    const checkIn = checkInPage.checkInButton;
    const alreadyCheckedIn = checkInPage.alreadyCheckedInButton;
    await expect(checkIn.or(alreadyCheckedIn)).toBeVisible();
  });

  test('should show Send SMS button', async ({ checkInPage }) => {
    await expect(checkInPage.sendSmsButton).toBeVisible();
  });

  test('should show Resend Ticket button', async ({ checkInPage }) => {
    await expect(checkInPage.resendTicketButton).toBeVisible();
  });
});

// =============================================================================
// CHECK-IN ACTION
// =============================================================================

test.describe('Check-In — Check-In Action', () => {
  test.describe.configure({ mode: 'serial' });

  // NOTE: These tests perform a real check-in on staging.
  // They dynamically find the first unchecked guest to avoid failures
  // when previously-used guests are already checked in.

  let selectedGuestName: string;

  test.beforeEach(async ({ checkInPage }) => {
    await checkInPage.goto();
    await checkInPage.searchAndSelectEvent(APOLLO_SEARCH, KNOWN_EVENT);

    // Page through guests to find one that hasn't been checked in yet
    const guestName = await checkInPage.findUncheckedGuest();
    test.skip(!guestName, 'All guests are already checked in — skip destructive tests');
    selectedGuestName = guestName!;
  });

  test('should open confirmation dialog when Check-In button is clicked', async ({ checkInPage }) => {
    await checkInPage.checkInButton.click();
    await expect(checkInPage.checkInDialog).toBeVisible({ timeout: 5000 });
    await expect(checkInPage.checkInDialogHeading).toBeVisible();
    await expect(checkInPage.page.locator('text=Select how many tickets to check-in')).toBeVisible();
    await expect(checkInPage.checkInDialogConfirmButton).toBeVisible();
    await expect(checkInPage.checkInDialogCancelButton).toBeVisible();
  });

  test('should close dialog without checking in when Cancel is clicked', async ({ checkInPage }) => {
    await checkInPage.checkInButton.click();
    await expect(checkInPage.checkInDialog).toBeVisible({ timeout: 5000 });

    await checkInPage.checkInDialogCancelButton.click();
    await expect(checkInPage.checkInDialog).not.toBeVisible({ timeout: 5000 });

    // Check-In button should still be available (guest was NOT checked in)
    await expect(checkInPage.checkInButton).toBeVisible();
  });

  test('should show success toast after confirming check-in', async ({ checkInPage }) => {
    await checkInPage.checkInButton.click();
    await expect(checkInPage.checkInDialog).toBeVisible({ timeout: 5000 });
    await checkInPage.checkInDialogConfirmButton.click();

    await expect(checkInPage.page.getByText(`Checked in ${selectedGuestName}`, { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('should turn guest card green after successful check-in', async ({ checkInPage }) => {
    await checkInPage.checkInButton.click();
    await expect(checkInPage.checkInDialog).toBeVisible({ timeout: 5000 });
    await checkInPage.checkInDialogConfirmButton.click();

    // Wait for success toast
    await expect(checkInPage.page.getByText(`Checked in ${selectedGuestName}`, { exact: true })).toBeVisible({ timeout: 10000 });

    // The checked-in guest card should become green (bg-green-50)
    const checkedInCard = checkInPage.page.locator('[class*="bg-green-50"]').filter({ hasText: selectedGuestName });
    await expect(checkedInCard).toBeVisible({ timeout: 5000 });
  });
});
