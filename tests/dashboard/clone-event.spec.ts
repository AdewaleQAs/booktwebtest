import { test, expect } from '../../fixtures';
import { getFutureDate, getEndDate } from '../../utils/date-helpers';

/**
 * Clone Event Flow — E2E Tests
 *
 * Tests the clone event feature which allows organizers to duplicate an ended event.
 * The "Clone Event" link only appears on ended event detail pages.
 * Cloning loads the same 3-step wizard as Create Event, but with pre-filled data
 * from the source event (except image and dates).
 *
 * Key difference from Create Event wizard:
 * - Step 3 carries over existing tickets from the source event as ticket cards
 *   (no empty ticket form). The "Add new ticket category" button is available
 *   to add more tickets. Publish button is immediately available.
 *
 * Requires authenticated session (chromium-authenticated project).
 */

// Known ended event on staging — used as the source for cloning
const ENDED_EVENT_ID = 1865;

// Known active event on staging — used to verify clone is NOT available
const ACTIVE_EVENT_ID = 1878;

// Compute future dates for clone tests (need to fill in dates since they're not pre-filled)
const startDate = getFutureDate(14);
const endDate = getEndDate(14, 1);

// Shared test data for clone wizard completion
const cloneTestData = {
  organizerName: 'Test Organizer',
  organizerAbout: 'We are a test organizer for automated E2E testing.',
};

// =============================================================================
// CLONE EVENT VISIBILITY — Verify link appears only on ended events
// =============================================================================

test.describe('Clone Event Visibility', () => {
  test('should show Clone Event link on ended event detail page', async ({ cloneEventPage }) => {
    await cloneEventPage.gotoEventDetail(ENDED_EVENT_ID);
    await expect(cloneEventPage.cloneEventLink).toBeVisible({ timeout: 10000 });
  });

  test('should show View Ticket(s) link on ended event detail page', async ({ cloneEventPage }) => {
    await cloneEventPage.gotoEventDetail(ENDED_EVENT_ID);
    await expect(cloneEventPage.viewTicketsLink).toBeVisible({ timeout: 10000 });
  });

  test('should NOT show Clone Event link on active event detail page', async ({ cloneEventPage }) => {
    await cloneEventPage.gotoEventDetail(ACTIVE_EVENT_ID);
    await expect(cloneEventPage.cloneEventLink).not.toBeVisible({ timeout: 5000 });
  });
});

// =============================================================================
// CLONE EVENT PAGE — Pre-filled State
// =============================================================================

test.describe('Clone Event — Pre-filled State', () => {
  test.beforeEach(async ({ cloneEventPage }) => {
    await cloneEventPage.goto(ENDED_EVENT_ID);
  });

  test('should display Clone Event heading', async ({ cloneEventPage }) => {
    await cloneEventPage.expectToBeOnCloneEventPage();
  });

  test('should have event name pre-filled', async ({ cloneEventPage }) => {
    await cloneEventPage.expectEventNamePreFilled();
  });

  test('should have event type pre-filled', async ({ cloneEventPage, page }) => {
    // The hidden select element holds the actual selected value
    const selectValue = await cloneEventPage.eventTypeHiddenSelect.inputValue();
    expect(selectValue.length).toBeGreaterThan(0);
  });

  test('should have address pre-filled', async ({ cloneEventPage }) => {
    await cloneEventPage.expectAddressPreFilled();
  });

  test('should have event about pre-filled', async ({ cloneEventPage }) => {
    await cloneEventPage.expectEventAboutPreFilled();
  });
});

// =============================================================================
// CLONE EVENT PAGE — Empty Fields (not pre-filled)
// =============================================================================

test.describe('Clone Event — Empty Fields', () => {
  test.beforeEach(async ({ cloneEventPage }) => {
    await cloneEventPage.goto(ENDED_EVENT_ID);
  });

  test('should NOT have image pre-filled', async ({ cloneEventPage }) => {
    await cloneEventPage.expectImageNotPreFilled();
  });

  test('should NOT have start date pre-filled', async ({ cloneEventPage }) => {
    await expect(cloneEventPage.startDateButton).toContainText('Select start date');
  });

  test('should NOT have end date pre-filled', async ({ cloneEventPage }) => {
    await expect(cloneEventPage.endDateButton).toContainText('Select end date');
  });
});

// =============================================================================
// CLONE EVENT PAGE — Next Button Validation
// =============================================================================

test.describe('Clone Event — Next Button Validation', () => {
  test.beforeEach(async ({ cloneEventPage }) => {
    await cloneEventPage.goto(ENDED_EVENT_ID);
  });

  test('should have Next button disabled on page load', async ({ cloneEventPage }) => {
    await cloneEventPage.expectNextButtonDisabled();
  });

  test('should enable Next button after uploading image and selecting dates', async ({ cloneEventPage }) => {
    await cloneEventPage.uploadImageAndSkipCrop();
    await cloneEventPage.selectStartDate(startDate.day, startDate.monthYear);
    await cloneEventPage.selectEndDate(endDate.day, endDate.monthYear);
    await cloneEventPage.expectNextButtonEnabled();
  });
});

// =============================================================================
// CLONE EVENT PAGE — Step 3 (Tickets carry over from source event)
// =============================================================================

test.describe('Clone Event — Step 3 Tickets', () => {
  test.describe.configure({ timeout: 60000 });

  test('should carry over existing tickets from source event', async ({ cloneEventPage, page }) => {
    await cloneEventPage.goto(ENDED_EVENT_ID);

    // Step 1: Fill missing fields and advance
    await cloneEventPage.uploadImageAndSkipCrop();
    await cloneEventPage.selectStartDate(startDate.day, startDate.monthYear);
    await cloneEventPage.selectEndDate(endDate.day, endDate.monthYear);
    await cloneEventPage.clickNext();

    // Step 2: Organizer info
    await cloneEventPage.expectStep2Visible();
    await cloneEventPage.completeStep2({
      organizerName: cloneTestData.organizerName,
      organizerAbout: cloneTestData.organizerAbout,
    });

    // Step 3: Should show existing ticket cards (not empty form)
    await expect(cloneEventPage.publishButton).toBeVisible({ timeout: 10000 });
    // Existing tickets from source event should be visible as cards
    await expect(page.getByRole('button', { name: 'Add new ticket category' })).toBeVisible();
  });

  test('should show Publish button on Step 3', async ({ cloneEventPage }) => {
    await cloneEventPage.goto(ENDED_EVENT_ID);

    await cloneEventPage.uploadImageAndSkipCrop();
    await cloneEventPage.selectStartDate(startDate.day, startDate.monthYear);
    await cloneEventPage.selectEndDate(endDate.day, endDate.monthYear);
    await cloneEventPage.clickNext();

    await cloneEventPage.expectStep2Visible();
    await cloneEventPage.completeStep2({
      organizerName: cloneTestData.organizerName,
      organizerAbout: cloneTestData.organizerAbout,
    });

    await expect(cloneEventPage.publishButton).toBeVisible({ timeout: 10000 });
    await cloneEventPage.expectPublishButtonEnabled();
  });
});

// =============================================================================
// HAPPY PATH — Clone & Publish (with existing tickets from source event)
// =============================================================================

test.describe('Happy Path — Clone & Publish', () => {
  test.describe.configure({ timeout: 60000 });

  test('should clone ended event and publish with existing tickets', async ({ cloneEventPage }) => {
    await cloneEventPage.goto(ENDED_EVENT_ID);

    // Step 1: Fill missing fields (image + dates) and advance
    await cloneEventPage.uploadImageAndSkipCrop();
    await cloneEventPage.selectStartDate(startDate.day, startDate.monthYear);
    await cloneEventPage.selectEndDate(endDate.day, endDate.monthYear);
    await cloneEventPage.clickNext();

    // Step 2: Organizer info (may be pre-filled, fill to be safe)
    await cloneEventPage.expectStep2Visible();
    await cloneEventPage.completeStep2({
      organizerName: cloneTestData.organizerName,
      organizerAbout: cloneTestData.organizerAbout,
    });

    // Step 3: Tickets carry over from source event — just publish
    await expect(cloneEventPage.publishButton).toBeVisible({ timeout: 10000 });
    await cloneEventPage.clickPublish();

    await cloneEventPage.expectRedirectToEventsPage();
  });
});

// =============================================================================
// SAVE DRAFT from Clone
// =============================================================================

test.describe('Clone Event — Save Draft', () => {
  test.describe.configure({ timeout: 60000 });

  test('should save draft from Step 2 of cloned event', async ({ cloneEventPage }) => {
    await cloneEventPage.goto(ENDED_EVENT_ID);

    // Step 1: Fill missing fields and advance
    await cloneEventPage.uploadImageAndSkipCrop();
    await cloneEventPage.selectStartDate(startDate.day, startDate.monthYear);
    await cloneEventPage.selectEndDate(endDate.day, endDate.monthYear);
    await cloneEventPage.clickNext();

    // Step 2: Fill organizer info then save draft
    await cloneEventPage.expectStep2Visible();
    await cloneEventPage.fillOrganizerName(cloneTestData.organizerName);
    await cloneEventPage.fillOrganizerAbout(cloneTestData.organizerAbout);
    await cloneEventPage.clickSaveDraft();

    await cloneEventPage.expectRedirectToEventsPage();
  });
});
