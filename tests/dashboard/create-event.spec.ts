import { test, expect } from '../../fixtures';
import { getFutureDate, getEndDate } from '../../utils/date-helpers';

/**
 * Event Creation Wizard — E2E Tests
 *
 * Tests the 3-step event creation wizard at /events/new:
 *   Step 1: Basic Event Info (image, name, type, location, dates, about)
 *   Step 2: Options & Organizer (organizer name/about, toggles)
 *   Step 3: Tickets & Publish (ticket type, name, quantity, price, publish)
 *
 * Requires authenticated session (chromium-authenticated project).
 */

// Compute future dates once — reused across all tests
const startDate = getFutureDate(14);
const endDate = getEndDate(14, 1);

// Shared test data
const testEvent = {
  name: 'E2E Test Event',
  type: 'Concert',
  address: '123 Test Street, New York, NY 10001',
  about: 'This is an automated E2E test event created by Playwright.',
  organizerName: 'Test Organizer',
  organizerAbout: 'We are a test organizer for automated E2E testing.',
  ticketName: 'General Admission',
  ticketQuantity: '100',
  ticketPrice: '25',
  ticketDescription: 'Standard entry ticket for the event.',
  minimumDonation: '5',
  suggestedAmount: '10',
};

// =============================================================================
// HAPPY PATHS — Full wizard, publish event with each ticket type
// =============================================================================

test.describe('Happy Path — Publish Event', () => {
  // Full wizard + publish can take longer than default 30s timeout
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ createEventPage }) => {
    await createEventPage.goto();
  });

  test('should publish event with Free ticket', async ({ createEventPage }) => {
    await createEventPage.completeStep1({
      eventName: `${testEvent.name} - Free`,
      eventType: testEvent.type,
      address: testEvent.address,
      startDay: startDate.day,
      startMonthYear: startDate.monthYear,
      endDay: endDate.day,
      endMonthYear: endDate.monthYear,
      eventAbout: testEvent.about,
    });

    await createEventPage.expectStep2Visible();

    await createEventPage.completeStep2({
      organizerName: testEvent.organizerName,
      organizerAbout: testEvent.organizerAbout,
    });

    await createEventPage.expectStep3Visible();

    await createEventPage.completeStep3WithFreeTicket({
      ticketName: testEvent.ticketName,
      ticketQuantity: testEvent.ticketQuantity,
    });

    await createEventPage.expectRedirectToEventsPage();
  });

  test('should publish event with Paid ticket', async ({ createEventPage }) => {
    await createEventPage.completeStep1({
      eventName: `${testEvent.name} - Paid`,
      eventType: testEvent.type,
      address: testEvent.address,
      startDay: startDate.day,
      startMonthYear: startDate.monthYear,
      endDay: endDate.day,
      endMonthYear: endDate.monthYear,
      eventAbout: testEvent.about,
    });

    await createEventPage.expectStep2Visible();

    await createEventPage.completeStep2({
      organizerName: testEvent.organizerName,
      organizerAbout: testEvent.organizerAbout,
    });

    await createEventPage.expectStep3Visible();

    await createEventPage.completeStep3WithPaidTicket({
      ticketName: testEvent.ticketName,
      ticketQuantity: testEvent.ticketQuantity,
      ticketPrice: testEvent.ticketPrice,
      plan: 'base',
    });

    await createEventPage.expectRedirectToEventsPage();
  });

  test('should publish event with Donation ticket', async ({
    createEventPage,
  }) => {
    await createEventPage.completeStep1({
      eventName: `${testEvent.name} - Donation`,
      eventType: testEvent.type,
      address: testEvent.address,
      startDay: startDate.day,
      startMonthYear: startDate.monthYear,
      endDay: endDate.day,
      endMonthYear: endDate.monthYear,
      eventAbout: testEvent.about,
    });

    await createEventPage.expectStep2Visible();

    await createEventPage.completeStep2({
      organizerName: testEvent.organizerName,
      organizerAbout: testEvent.organizerAbout,
    });

    await createEventPage.expectStep3Visible();

    await createEventPage.completeStep3WithDonationTicket({
      ticketName: testEvent.ticketName,
      ticketQuantity: testEvent.ticketQuantity,
      minimumDonation: testEvent.minimumDonation,
    });

    await createEventPage.expectRedirectToEventsPage();
  });

  test('should publish event with Pay Anything ticket', async ({
    createEventPage,
  }) => {
    await createEventPage.completeStep1({
      eventName: `${testEvent.name} - Pay Anything`,
      eventType: testEvent.type,
      address: testEvent.address,
      startDay: startDate.day,
      startMonthYear: startDate.monthYear,
      endDay: endDate.day,
      endMonthYear: endDate.monthYear,
      eventAbout: testEvent.about,
    });

    await createEventPage.expectStep2Visible();

    await createEventPage.completeStep2({
      organizerName: testEvent.organizerName,
      organizerAbout: testEvent.organizerAbout,
    });

    await createEventPage.expectStep3Visible();

    await createEventPage.completeStep3WithPayAnythingTicket({
      ticketName: testEvent.ticketName,
      ticketQuantity: testEvent.ticketQuantity,
      suggestedAmount: testEvent.suggestedAmount,
    });

    await createEventPage.expectRedirectToEventsPage();
  });
});

// =============================================================================
// STEP 1 — Basic Event Info
// =============================================================================

test.describe('Step 1 — Basic Event Info', () => {
  test.beforeEach(async ({ createEventPage }) => {
    await createEventPage.goto();
  });

  // ---- Page Elements ----

  test.describe('Page Elements', () => {
    test('should display all form elements', async ({ createEventPage }) => {
      await expect(createEventPage.heading).toBeVisible();
      await expect(createEventPage.imageUploadArea).toBeVisible();
      await expect(createEventPage.imageValidationMessage).toBeVisible();
      await expect(createEventPage.eventNameInput).toBeVisible();
      await expect(createEventPage.eventTypeCombobox).toBeVisible();
      await expect(createEventPage.addressInput).toBeVisible();
      await expect(createEventPage.startDateButton).toBeVisible();
      await expect(createEventPage.endDateButton).toBeVisible();
      await expect(createEventPage.eventAboutEditor).toBeVisible();
    });

    test('should have In Person radio selected by default', async ({
      createEventPage,
    }) => {
      await expect(createEventPage.inPersonRadio).toBeChecked();
      await expect(createEventPage.virtualRadio).not.toBeChecked();
    });

    test('should display timezone auto-detected', async ({
      createEventPage,
    }) => {
      await expect(createEventPage.defaultTimezoneInput).toBeVisible();
      // The timezone input should have a value (auto-detected from browser)
      const tzValue = await createEventPage.defaultTimezoneInput.inputValue();
      expect(tzValue.length).toBeGreaterThan(0);
    });

    test('should display Prompts and Create Poll buttons', async ({
      createEventPage,
    }) => {
      await expect(createEventPage.promptsButton).toBeVisible();
      await expect(createEventPage.createPollButton).toBeVisible();
    });
  });

  // ---- Image Upload & Crop Modal ----

  test.describe('Image Upload & Crop Modal', () => {
    test('should show crop modal after image upload', async ({
      createEventPage,
    }) => {
      await createEventPage.uploadImage();
      await createEventPage.expectCropModalVisible();
    });

    test('should dismiss crop modal with Skip Crop', async ({
      createEventPage,
    }) => {
      await createEventPage.uploadImage();
      await createEventPage.skipCrop();
      await expect(createEventPage.cropModalHeading).not.toBeVisible();
    });

    test('should dismiss crop modal with Apply Crop', async ({
      createEventPage,
    }) => {
      await createEventPage.uploadImage();
      await createEventPage.applyCrop();
      await expect(createEventPage.cropModalHeading).not.toBeVisible();
    });

    test('should dismiss crop modal with Cancel', async ({
      createEventPage,
    }) => {
      await createEventPage.uploadImage();
      await createEventPage.cancelCrop();
      await expect(createEventPage.cropModalHeading).not.toBeVisible();
    });
  });

  // ---- Next Button Validation — All fields required ----

  test.describe('Next Button Validation', () => {
    test('should disable Next button with no fields filled', async ({
      createEventPage,
    }) => {
      await createEventPage.expectNextButtonDisabled();
    });

    test('should disable Next button with only image uploaded', async ({
      createEventPage,
    }) => {
      await createEventPage.uploadImageAndSkipCrop();
      await createEventPage.expectNextButtonDisabled();
    });

    test('should disable Next button without event name', async ({
      createEventPage,
    }) => {
      // Fill everything EXCEPT event name
      await createEventPage.uploadImageAndSkipCrop();
      await createEventPage.selectEventType(testEvent.type);
      await createEventPage.fillAddress(testEvent.address);
      await createEventPage.selectStartDate(startDate.day, startDate.monthYear);
      await createEventPage.selectEndDate(endDate.day, endDate.monthYear);
      await createEventPage.fillEventAbout(testEvent.about);

      await createEventPage.expectNextButtonDisabled();
    });

    test('should disable Next button without event type', async ({
      createEventPage,
    }) => {
      // Fill everything EXCEPT event type
      await createEventPage.uploadImageAndSkipCrop();
      await createEventPage.fillEventName(testEvent.name);
      await createEventPage.fillAddress(testEvent.address);
      await createEventPage.selectStartDate(startDate.day, startDate.monthYear);
      await createEventPage.selectEndDate(endDate.day, endDate.monthYear);
      await createEventPage.fillEventAbout(testEvent.about);

      await createEventPage.expectNextButtonDisabled();
    });

    test('should disable Next button without address', async ({
      createEventPage,
    }) => {
      // Fill everything EXCEPT address
      await createEventPage.uploadImageAndSkipCrop();
      await createEventPage.fillEventName(testEvent.name);
      await createEventPage.selectEventType(testEvent.type);
      await createEventPage.selectStartDate(startDate.day, startDate.monthYear);
      await createEventPage.selectEndDate(endDate.day, endDate.monthYear);
      await createEventPage.fillEventAbout(testEvent.about);

      await createEventPage.expectNextButtonDisabled();
    });

    test('should disable Next button without start date', async ({
      createEventPage,
    }) => {
      // Fill everything EXCEPT start date
      await createEventPage.uploadImageAndSkipCrop();
      await createEventPage.fillEventName(testEvent.name);
      await createEventPage.selectEventType(testEvent.type);
      await createEventPage.fillAddress(testEvent.address);
      await createEventPage.selectEndDate(endDate.day, endDate.monthYear);
      await createEventPage.fillEventAbout(testEvent.about);

      await createEventPage.expectNextButtonDisabled();
    });

    test('should disable Next button without end date', async ({
      createEventPage,
    }) => {
      // Fill everything EXCEPT end date
      await createEventPage.uploadImageAndSkipCrop();
      await createEventPage.fillEventName(testEvent.name);
      await createEventPage.selectEventType(testEvent.type);
      await createEventPage.fillAddress(testEvent.address);
      await createEventPage.selectStartDate(startDate.day, startDate.monthYear);
      await createEventPage.fillEventAbout(testEvent.about);

      await createEventPage.expectNextButtonDisabled();
    });

    test('should disable Next button without event about', async ({
      createEventPage,
    }) => {
      // Fill everything EXCEPT event about
      await createEventPage.uploadImageAndSkipCrop();
      await createEventPage.fillEventName(testEvent.name);
      await createEventPage.selectEventType(testEvent.type);
      await createEventPage.fillAddress(testEvent.address);
      await createEventPage.selectStartDate(startDate.day, startDate.monthYear);
      await createEventPage.selectEndDate(endDate.day, endDate.monthYear);

      await createEventPage.expectNextButtonDisabled();
    });

    test('should enable Next button when ALL required fields are filled', async ({
      createEventPage,
    }) => {
      await createEventPage.uploadImageAndSkipCrop();
      await createEventPage.fillEventName(testEvent.name);
      await createEventPage.selectEventType(testEvent.type);
      await createEventPage.fillAddress(testEvent.address);
      await createEventPage.selectStartDate(startDate.day, startDate.monthYear);
      await createEventPage.selectEndDate(endDate.day, endDate.monthYear);
      await createEventPage.fillEventAbout(testEvent.about);

      await createEventPage.expectNextButtonEnabled();
    });
  });

  // ---- Other Step 1 Features ----

  test.describe('Other Features', () => {
    test('should show private event warning when toggle enabled', async ({
      createEventPage,
    }) => {
      await createEventPage.makeEventPrivateToggle.click();
      await createEventPage.expectPrivateEventWarningVisible();
    });

    test('should accept text input in rich text editor', async ({
      createEventPage,
    }) => {
      const testText = 'Testing rich text editor input';
      await createEventPage.fillEventAbout(testText);

      const editorText = await createEventPage.eventAboutEditor.textContent();
      expect(editorText).toContain(testText);
    });

    test('should show Save Draft button', async ({ createEventPage }) => {
      await expect(createEventPage.saveDraftButton).toBeVisible();
    });

    test('should show toggle options for guest communication and custom timezone', async ({
      createEventPage,
    }) => {
      await expect(
        createEventPage.allowGuestCommunicationToggle
      ).toBeVisible();
      await expect(createEventPage.customTimezoneToggle).toBeVisible();
    });
  });
});

// =============================================================================
// STEP 2 — Options & Organizer
// =============================================================================

test.describe('Step 2 — Options & Organizer', () => {
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ createEventPage }) => {
    await createEventPage.goto();
    // Complete Step 1 to reach Step 2
    await createEventPage.completeStep1({
      eventName: testEvent.name,
      eventType: testEvent.type,
      address: testEvent.address,
      startDay: startDate.day,
      startMonthYear: startDate.monthYear,
      endDay: endDate.day,
      endMonthYear: endDate.monthYear,
      eventAbout: testEvent.about,
    });
  });

  test('should display all Step 2 form elements', async ({
    createEventPage,
  }) => {
    await createEventPage.expectStep2Visible();
    await expect(createEventPage.jumpTheLineToggle).toBeVisible();
    await expect(createEventPage.autoDynamicPricingToggle).toBeVisible();
    await expect(createEventPage.organizerNameInput).toBeVisible();
    await expect(createEventPage.organizerAboutInput).toBeVisible();
    await expect(createEventPage.addCollaboratorToggle).toBeVisible();
  });

  test('should show validation errors when both organizer fields empty', async ({
    createEventPage,
  }) => {
    // Clear pre-populated fields (they may have data from user profile)
    await createEventPage.clearOrganizerFields();
    await createEventPage.clickNext();
    await createEventPage.expectOrganizerValidationErrors();
  });

  test('should show organizer name required error when only about is filled', async ({
    createEventPage,
  }) => {
    // Clear pre-populated fields first
    await createEventPage.clearOrganizerFields();
    await createEventPage.fillOrganizerAbout(testEvent.organizerAbout);
    await createEventPage.clickNext();
    await expect(createEventPage.organizerRequiredError).toBeVisible();
  });

  test('should show organizer about required error when only name is filled', async ({
    createEventPage,
  }) => {
    // Clear pre-populated fields first
    await createEventPage.clearOrganizerFields();
    await createEventPage.fillOrganizerName(testEvent.organizerName);
    await createEventPage.clickNext();
    await expect(createEventPage.organizerAboutRequiredError).toBeVisible();
  });

  test('should advance to Step 3 with valid organizer info', async ({
    createEventPage,
  }) => {
    await createEventPage.completeStep2({
      organizerName: testEvent.organizerName,
      organizerAbout: testEvent.organizerAbout,
    });
    await createEventPage.expectStep3Visible();
  });

  test('should have toggle defaults off for Jump The Line and dynamic pricing', async ({
    createEventPage,
  }) => {
    // Custom toggles use bg-gradient-to-r from-purple when ON.
    // When OFF, they should NOT have the purple gradient class.
    await expect(createEventPage.jumpTheLineToggle).not.toHaveClass(/from-purple/);
    await expect(createEventPage.autoDynamicPricingToggle).not.toHaveClass(
      /from-purple/
    );
  });

  test('should show Save Draft and Back buttons', async ({
    createEventPage,
  }) => {
    await expect(createEventPage.saveDraftButton).toBeVisible();
    await expect(createEventPage.backButton).toBeVisible();
  });
});

// =============================================================================
// STEP 3 — Tickets & Publish
// =============================================================================

test.describe('Step 3 — Tickets & Publish', () => {
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ createEventPage }) => {
    await createEventPage.goto();
    // Complete Steps 1 & 2 to reach Step 3
    await createEventPage.completeStep1({
      eventName: testEvent.name,
      eventType: testEvent.type,
      address: testEvent.address,
      startDay: startDate.day,
      startMonthYear: startDate.monthYear,
      endDay: endDate.day,
      endMonthYear: endDate.monthYear,
      eventAbout: testEvent.about,
    });
    await createEventPage.completeStep2({
      organizerName: testEvent.organizerName,
      organizerAbout: testEvent.organizerAbout,
    });
  });

  test('should display all Step 3 ticket elements', async ({
    createEventPage,
  }) => {
    await createEventPage.expectStep3Visible();
    await expect(createEventPage.sellTicketToggle).toBeVisible();
    await expect(createEventPage.freeTicketRadio).toBeVisible();
    await expect(createEventPage.paidTicketRadio).toBeVisible();
    await expect(createEventPage.donationTicketRadio).toBeVisible();
    await expect(createEventPage.payAnythingTicketRadio).toBeVisible();
    await expect(createEventPage.ticketNameInput).toBeVisible();
    await expect(createEventPage.ticketQuantityInput).toBeVisible();
    await expect(createEventPage.publishButton).toBeVisible();
  });

  test('should have sell ticket toggle ON by default', async ({
    createEventPage,
  }) => {
    // Custom toggle uses bg-gradient-to-r from-purple classes when ON
    await expect(createEventPage.sellTicketToggle).toHaveClass(/from-purple/);
  });

  test('should have Free ticket type selected by default', async ({
    createEventPage,
  }) => {
    // Free should be visually selected (default state)
    await expect(createEventPage.ticketNameInput).toBeVisible();
    await expect(createEventPage.ticketQuantityInput).toBeVisible();
    // Price input should NOT be visible for Free tickets
    await expect(createEventPage.ticketPriceInput).not.toBeVisible();
  });

  test('should show price and plan fields when Paid type selected', async ({
    createEventPage,
  }) => {
    await createEventPage.selectTicketType('Paid');
    await expect(createEventPage.ticketPriceInput).toBeVisible();
    await expect(createEventPage.baseFeeOption).toBeVisible();
    await expect(createEventPage.takeOnCostOption).toBeVisible();
  });

  test('should show minimum donation field when Donation type selected', async ({
    createEventPage,
  }) => {
    await createEventPage.selectTicketType('Donation');
    await expect(createEventPage.minimumDonationInput).toBeVisible();
    // Price input should NOT be visible for Donation tickets
    await expect(createEventPage.ticketPriceInput).not.toBeVisible();
  });

  test('should show suggested amount field when Pay Anything type selected', async ({
    createEventPage,
  }) => {
    await createEventPage.selectTicketType('Pay Anything');
    await expect(createEventPage.suggestedAmountInput).toBeVisible();
    // Price input should NOT be visible for Pay Anything tickets
    await expect(createEventPage.ticketPriceInput).not.toBeVisible();
  });

  test('should have Immediately availability selected by default', async ({
    createEventPage,
  }) => {
    await expect(createEventPage.immediatelyRadio).toBeVisible();
  });

  test('should display additional option toggles', async ({
    createEventPage,
  }) => {
    await expect(createEventPage.approvalRequiredToggle).toBeVisible();
    await expect(createEventPage.setExpiryToggle).toBeVisible();
    await expect(createEventPage.restrictTicketsToggle).toBeVisible();
    await expect(createEventPage.preSaleWaitlistToggle).toBeVisible();
    await expect(createEventPage.requirePasscodeToggle).toBeVisible();
    await expect(createEventPage.redirectAfterPurchaseToggle).toBeVisible();
  });

  test('should display Terms and Conditions link', async ({
    createEventPage,
  }) => {
    await expect(createEventPage.termsAndConditionsLink).toBeVisible();
  });
});

// =============================================================================
// KNOWN BUG — Publish Button Validation
// =============================================================================

test.describe('Known Bug — Publish Button Validation', () => {
  test.describe.configure({ timeout: 60000 });

  /**
   * BUG: Ticket name and ticket quantity are REQUIRED fields for all ticket
   * types, but the Publish button is NOT disabled when they are empty.
   *
   * Expected behavior: Publish button should be disabled (greyed out) when
   * ticket name or ticket quantity is empty.
   *
   * Actual behavior: Publish button is enabled and publishing succeeds,
   * creating an event with missing ticket information.
   *
   * These tests document the ACTUAL (buggy) behavior. When the bug is fixed,
   * update the assertions from `toBeEnabled()` to `toBeDisabled()`.
   */

  test.beforeEach(async ({ createEventPage }) => {
    await createEventPage.goto();
    // Complete Steps 1 & 2 to reach Step 3
    await createEventPage.completeStep1({
      eventName: `${testEvent.name} - Bug Test`,
      eventType: testEvent.type,
      address: testEvent.address,
      startDay: startDate.day,
      startMonthYear: startDate.monthYear,
      endDay: endDate.day,
      endMonthYear: endDate.monthYear,
      eventAbout: testEvent.about,
    });
    await createEventPage.completeStep2({
      organizerName: testEvent.organizerName,
      organizerAbout: testEvent.organizerAbout,
    });
  });

  test('BUG: Publish button enabled with empty ticket name', async ({
    createEventPage,
  }) => {
    // Only fill quantity, leave name empty
    await createEventPage.fillTicketQuantity(testEvent.ticketQuantity);

    // BUG: Button should be disabled but is enabled
    // When fixed, change toBeEnabled() → toBeDisabled()
    await createEventPage.expectPublishButtonEnabled();
  });

  test('BUG: Publish button enabled with empty ticket quantity', async ({
    createEventPage,
  }) => {
    // Only fill name, leave quantity empty
    await createEventPage.fillTicketName(testEvent.ticketName);

    // BUG: Button should be disabled but is enabled
    // When fixed, change toBeEnabled() → toBeDisabled()
    await createEventPage.expectPublishButtonEnabled();
  });

  test('BUG: Publish button enabled with both ticket name and quantity empty', async ({
    createEventPage,
  }) => {
    // Leave both fields empty

    // BUG: Button should be disabled but is enabled
    // When fixed, change toBeEnabled() → toBeDisabled()
    await createEventPage.expectPublishButtonEnabled();
  });
});

// =============================================================================
// SAVE DRAFT — From each step
// =============================================================================

test.describe('Save Draft', () => {
  test.describe.configure({ timeout: 60000 });

  /**
   * BUG: Save Draft from Step 1 fails with a JavaScript error when an image
   * is uploaded. The error toast shows:
   *   "Cannot use 'in' operator to search for 'file' in undefined"
   *
   * Without an image, Save Draft silently fails with no feedback.
   *
   * Expected behavior: Save Draft should save the event as a draft and
   * redirect to the events page (like Save Draft from Steps 2 and 3).
   *
   * Actual behavior: An error toast appears and the page stays on /events/new.
   *
   * When the bug is fixed, update this test to verify the redirect.
   */
  test('BUG: should save draft from Step 1', async ({ createEventPage }) => {
    await createEventPage.goto();
    // Fill all required Step 1 fields before saving draft
    await createEventPage.uploadImageAndSkipCrop();
    await createEventPage.fillEventName(`${testEvent.name} - Draft Step 1`);
    await createEventPage.selectEventType(testEvent.type);
    await createEventPage.fillAddress(testEvent.address);
    await createEventPage.selectStartDate(startDate.day, startDate.monthYear);
    await createEventPage.selectEndDate(endDate.day, endDate.monthYear);
    await createEventPage.fillEventAbout(testEvent.about);
    await createEventPage.clickSaveDraft();

    // BUG: Save Draft from Step 1 shows an error toast instead of redirecting.
    // When fixed, replace the error toast assertion with:
    //   await createEventPage.expectRedirectToEventsPage();
    await createEventPage.expectErrorToast(
      "Cannot use 'in' operator to search for 'file' in undefined"
    );
  });

  test('should save draft from Step 2', async ({ createEventPage }) => {
    await createEventPage.goto();
    await createEventPage.completeStep1({
      eventName: `${testEvent.name} - Draft Step 2`,
      eventType: testEvent.type,
      address: testEvent.address,
      startDay: startDate.day,
      startMonthYear: startDate.monthYear,
      endDay: endDate.day,
      endMonthYear: endDate.monthYear,
      eventAbout: testEvent.about,
    });
    await createEventPage.expectStep2Visible();
    await createEventPage.fillOrganizerName(testEvent.organizerName);
    await createEventPage.clickSaveDraft();

    await createEventPage.expectRedirectToEventsPage();
  });

  test('should save draft from Step 3', async ({ createEventPage }) => {
    await createEventPage.goto();
    await createEventPage.completeStep1({
      eventName: `${testEvent.name} - Draft Step 3`,
      eventType: testEvent.type,
      address: testEvent.address,
      startDay: startDate.day,
      startMonthYear: startDate.monthYear,
      endDay: endDate.day,
      endMonthYear: endDate.monthYear,
      eventAbout: testEvent.about,
    });
    await createEventPage.completeStep2({
      organizerName: testEvent.organizerName,
      organizerAbout: testEvent.organizerAbout,
    });
    await createEventPage.expectStep3Visible();
    await createEventPage.fillTicketName(testEvent.ticketName);
    await createEventPage.clickSaveDraft();

    await createEventPage.expectRedirectToEventsPage();
  });
});
