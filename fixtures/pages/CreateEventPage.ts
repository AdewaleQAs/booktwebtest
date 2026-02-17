import { Page, Locator, expect } from '@playwright/test';
import path from 'path';

export class CreateEventPage {
  readonly page: Page;

  // ---- Navigation / Common ----
  readonly heading: Locator;
  readonly backButton: Locator;
  readonly saveDraftButton: Locator;
  readonly nextButton: Locator;

  // ---- Step 1: Basic Event Info ----
  readonly imageUploadArea: Locator;
  readonly imageFileInput: Locator;
  readonly imageValidationMessage: Locator;
  readonly uploadedFilesLabel: Locator;
  readonly allowGuestCommunicationToggle: Locator;
  readonly makeEventPrivateToggle: Locator;
  readonly privateEventWarning: Locator;
  readonly eventNameInput: Locator;
  readonly eventTypeCombobox: Locator;
  readonly eventTypeHiddenSelect: Locator;
  readonly inPersonRadio: Locator;
  readonly virtualRadio: Locator;
  readonly onlySendAddressToggle: Locator;
  readonly addressInput: Locator;
  readonly defaultTimezoneInput: Locator;
  readonly customTimezoneToggle: Locator;
  readonly startDateButton: Locator;
  readonly endDateButton: Locator;
  readonly eventAboutEditor: Locator;
  readonly promptsButton: Locator;
  readonly createPollButton: Locator;

  // ---- Crop Modal ----
  readonly cropModalHeading: Locator;
  readonly cancelCropButton: Locator;
  readonly skipCropButton: Locator;
  readonly applyCropButton: Locator;

  // ---- Step 2: Options & Organizer ----
  readonly jumpTheLineToggle: Locator;
  readonly autoDynamicPricingToggle: Locator;
  readonly organizerInfoHeading: Locator;
  readonly organizerNameInput: Locator;
  readonly organizerAboutInput: Locator;
  readonly organizerRequiredError: Locator;
  readonly organizerAboutRequiredError: Locator;
  readonly addCollaboratorToggle: Locator;

  // ---- Step 3: Tickets & Publish ----
  readonly sellTicketToggle: Locator;
  readonly freeTicketRadio: Locator;
  readonly paidTicketRadio: Locator;
  readonly donationTicketRadio: Locator;
  readonly payAnythingTicketRadio: Locator;
  readonly approvalRequiredToggle: Locator;
  readonly ticketNameInput: Locator;
  readonly ticketQuantityInput: Locator;
  readonly ticketPriceInput: Locator;
  readonly ticketDescriptionInput: Locator;
  readonly minimumDonationInput: Locator;
  readonly suggestedAmountInput: Locator;
  readonly immediatelyRadio: Locator;
  readonly scheduleRadio: Locator;
  readonly setExpiryToggle: Locator;
  readonly restrictTicketsToggle: Locator;
  readonly addTicketButton: Locator;
  readonly preSaleWaitlistToggle: Locator;
  readonly requirePasscodeToggle: Locator;
  readonly redirectAfterPurchaseToggle: Locator;
  readonly baseFeeOption: Locator;
  readonly takeOnCostOption: Locator;
  readonly termsAndConditionsLink: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // ---- Navigation / Common ----
    this.heading = page.getByRole('heading', { name: 'Create Event' });
    this.backButton = page.getByRole('button', { name: 'Back' });
    this.saveDraftButton = page.getByRole('button', { name: 'Save Draft' });
    this.nextButton = page.getByRole('button', { name: 'Next' });

    // ---- Step 1: Basic Event Info ----
    this.imageUploadArea = page.getByText('Click to upload or drag and drop');
    this.imageFileInput = page.locator('input[type="file"]');
    this.imageValidationMessage = page.getByText('Please attach promotional images for your event');
    this.uploadedFilesLabel = page.getByText('Uploaded Files');
    this.allowGuestCommunicationToggle = page.getByRole('button', {
      name: 'Allow guests to communicate with you?',
    });
    this.makeEventPrivateToggle = page.getByRole('button', {
      name: 'Want to make this event private',
    });
    this.privateEventWarning = page.getByText(
      'Private events are accessed via links not displayed to the public'
    );
    this.eventNameInput = page.getByPlaceholder('Enter event name');
    this.eventTypeCombobox = page.getByText('Enter event description').first();
    this.eventTypeHiddenSelect = page.locator('select');
    this.inPersonRadio = page.getByRole('radio', { name: 'In Person' });
    this.virtualRadio = page.getByRole('radio', { name: 'Virtual' });
    this.onlySendAddressToggle = page.getByRole('button', {
      name: 'Only send address to ticket holders?',
    });
    this.addressInput = page.getByPlaceholder('Enter event address/location');
    this.defaultTimezoneInput = page.locator('input[name="current_time_zone"]');
    this.customTimezoneToggle = page.getByRole('button', {
      name: 'Use custom time zone for this event?',
    });
    this.startDateButton = page.getByRole('button', { name: 'Select start date' });
    this.endDateButton = page.getByRole('button', { name: 'Select end date' });
    this.eventAboutEditor = page.locator('[contenteditable="true"]').first();
    this.promptsButton = page.getByRole('button', { name: 'Prompts (Q&A)' });
    this.createPollButton = page.getByRole('button', { name: 'Create Poll' });

    // ---- Crop Modal ----
    this.cropModalHeading = page.getByRole('heading', { name: 'Crop Image' });
    this.cancelCropButton = page.getByRole('button', { name: 'Cancel' });
    this.skipCropButton = page.getByRole('button', { name: 'Skip Crop' });
    this.applyCropButton = page.getByRole('button', { name: 'Apply Crop' });

    // ---- Step 2: Options & Organizer ----
    this.jumpTheLineToggle = page.getByRole('button', {
      name: 'Allow people to Jump The Line?',
    });
    this.autoDynamicPricingToggle = page.getByRole('button', {
      name: 'Allow auto-dynamic pricing?',
    });
    this.organizerInfoHeading = page.getByText(
      "Let's gather some organizer information"
    );
    this.organizerNameInput = page.getByPlaceholder('Enter organizer name');
    this.organizerAboutInput = page.getByPlaceholder('Enter organizer about');
    this.organizerRequiredError = page.getByText('Organizer is required');
    this.organizerAboutRequiredError = page.getByText(
      'Organizer about is required'
    );
    this.addCollaboratorToggle = page.getByRole('button', {
      name: 'Add a collaborator?',
    });

    // ---- Step 3: Tickets & Publish ----
    this.sellTicketToggle = page.locator('#has_tickets');
    // Ticket type radios: Radix RadioGroup renders each option as a wrapper div containing
    // a visual button[role="radio"], a hidden input, and a label span.
    // Use the Radix button[role="radio"] for visibility checks; use dispatchEvent for selection.
    this.freeTicketRadio = page.locator('button[role="radio"][value="free"]');
    this.paidTicketRadio = page.locator('button[role="radio"][value="paid"]');
    this.donationTicketRadio = page.locator('button[role="radio"][value="donation"]');
    this.payAnythingTicketRadio = page.locator('button[role="radio"][value="pay_anything"]');
    this.approvalRequiredToggle = page.getByRole('button', {
      name: 'Is approval required?',
    });
    this.ticketNameInput = page.getByPlaceholder(
      'Enter ticket name e.g General Admission, VIP'
    );
    this.ticketQuantityInput = page.getByPlaceholder('Enter ticket quantity');
    this.ticketPriceInput = page.getByPlaceholder('Enter ticket price in $');
    this.ticketDescriptionInput = page.getByPlaceholder(
      'Enter ticket description (optional)'
    );
    this.minimumDonationInput = page.getByPlaceholder(
      'Enter minimum donation in $'
    );
    this.suggestedAmountInput = page.getByPlaceholder(
      'Enter suggested amount in $'
    );
    this.immediatelyRadio = page.getByText('Immediately', { exact: true });
    this.scheduleRadio = page.getByText('Schedule', { exact: true });
    this.setExpiryToggle = page.getByRole('button', {
      name: 'Set an expiry time and date?',
    });
    this.restrictTicketsToggle = page.getByRole('button', {
      name: 'Restrict number of tickets per guest?',
    });
    this.addTicketButton = page.getByRole('button', { name: 'Add Ticket' });
    this.preSaleWaitlistToggle = page.getByRole('button', {
      name: 'Enable Pre-sale waitlist?',
    });
    this.requirePasscodeToggle = page.getByRole('button', {
      name: 'Require Passcode for Event?',
    });
    this.redirectAfterPurchaseToggle = page.getByRole('button', {
      name: 'Redirect to your website after ticket purchase?',
    });
    this.baseFeeOption = page.getByRole('heading', { name: 'Base fee' });
    this.takeOnCostOption = page.getByRole('heading', { name: 'Take on the cost' });
    this.termsAndConditionsLink = page.getByRole('link', {
      name: 'Terms and Conditions',
    });
    this.publishButton = page.getByRole('button', { name: 'Publish Your Event' });
  }

  // =====================================================================
  // Navigation
  // =====================================================================

  async goto() {
    await this.page.goto('/events/new');
    await expect(this.heading).toBeVisible({ timeout: 15000 });
  }

  // =====================================================================
  // Step 1 Methods
  // =====================================================================

  /** Upload an image file. Triggers the crop modal. */
  async uploadImage(filePath?: string) {
    const imagePath =
      filePath ||
      path.resolve(__dirname, '..', 'test-assets', 'test-event-image.png');
    await this.imageFileInput.setInputFiles(imagePath);
    await expect(this.cropModalHeading).toBeVisible({ timeout: 10000 });
  }

  async skipCrop() {
    await this.skipCropButton.click();
    await expect(this.cropModalHeading).not.toBeVisible({ timeout: 5000 });
  }

  async applyCrop() {
    await this.applyCropButton.click();
    await expect(this.cropModalHeading).not.toBeVisible({ timeout: 5000 });
  }

  async cancelCrop() {
    await this.cancelCropButton.click();
    await expect(this.cropModalHeading).not.toBeVisible({ timeout: 5000 });
  }

  /** Upload image and skip the crop modal in one step. */
  async uploadImageAndSkipCrop(filePath?: string) {
    await this.uploadImage(filePath);
    await this.skipCrop();
  }

  async fillEventName(name: string) {
    await this.eventNameInput.fill(name);
  }

  /** Select an event type from the Radix combobox dropdown. */
  async selectEventType(type: string) {
    await this.eventTypeCombobox.click();
    await this.page.waitForTimeout(500);
    // Click the option from the dropdown overlay using getByLabel
    await this.page.getByLabel(type).getByText(type).click();
    await this.page.waitForTimeout(300);
  }

  async fillAddress(address: string) {
    await this.addressInput.fill(address);
  }

  async fillEventAbout(text: string) {
    await this.eventAboutEditor.click();
    await this.page.keyboard.type(text);
  }

  /**
   * Select a date in an open react-day-picker calendar popover.
   * Navigates months forward if the target month isn't currently shown.
   */
  private async selectCalendarDate(day: number, monthYear: string) {
    const dialog = this.page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Navigate to the correct month if needed
    const monthHeader = dialog.getByText(monthYear);
    const forwardButton = dialog.locator(
      'button[name="next-month"], button[aria-label="Go to next month"]'
    );

    // Try up to 12 months forward
    for (let i = 0; i < 12; i++) {
      if (await monthHeader.isVisible().catch(() => false)) break;
      await forwardButton.click();
      await this.page.waitForTimeout(300);
    }

    // Click the day button (use .first() to avoid matching trailing days from next month)
    const dayButton = dialog
      .locator('button[name="day"]:not([disabled])')
      .filter({ hasText: new RegExp(`^${day}$`) })
      .first();
    await dayButton.click();
    await this.page.waitForTimeout(300);

    // Close the popover
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  async selectStartDate(day: number, monthYear: string) {
    await this.startDateButton.click();
    await this.page.waitForTimeout(500);
    await this.selectCalendarDate(day, monthYear);
  }

  async selectEndDate(day: number, monthYear: string) {
    await this.endDateButton.click();
    await this.page.waitForTimeout(500);
    await this.selectCalendarDate(day, monthYear);
  }

  async clickNext() {
    await this.nextButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickSaveDraft() {
    await this.saveDraftButton.click();
    await this.page.waitForTimeout(2000);
  }

  /** Fill all required Step 1 fields and advance to Step 2. */
  async completeStep1(options: {
    eventName: string;
    eventType: string;
    address: string;
    startDay: number;
    startMonthYear: string;
    endDay: number;
    endMonthYear: string;
    eventAbout?: string;
    imagePath?: string;
  }) {
    await this.uploadImageAndSkipCrop(options.imagePath);
    await this.fillEventName(options.eventName);
    await this.selectEventType(options.eventType);
    await this.fillAddress(options.address);
    await this.selectStartDate(options.startDay, options.startMonthYear);
    await this.selectEndDate(options.endDay, options.endMonthYear);
    await this.fillEventAbout(options.eventAbout || 'Automated E2E test event.');
    await this.clickNext();
  }

  // =====================================================================
  // Step 2 Methods
  // =====================================================================

  async fillOrganizerName(name: string) {
    await this.organizerNameInput.fill(name);
  }

  async fillOrganizerAbout(about: string) {
    await this.organizerAboutInput.fill(about);
  }

  /** Clear organizer fields (they may be pre-populated from profile). */
  async clearOrganizerFields() {
    await this.organizerNameInput.clear();
    await this.organizerAboutInput.clear();
  }

  /** Fill organizer fields and advance to Step 3. */
  async completeStep2(options: {
    organizerName: string;
    organizerAbout: string;
  }) {
    await this.fillOrganizerName(options.organizerName);
    await this.fillOrganizerAbout(options.organizerAbout);
    await this.clickNext();
  }

  // =====================================================================
  // Step 3 Methods
  // =====================================================================

  async selectTicketType(type: 'Free' | 'Paid' | 'Donation' | 'Pay Anything') {
    // Ensure Step 3 is fully rendered before interacting with radios
    await expect(this.publishButton).toBeVisible({ timeout: 10000 });

    // Click the label text within the ticket type radiogroup.
    // Scope to the first radiogroup to avoid matching Immediately/Schedule.
    const ticketRadioGroup = this.page.getByRole('radiogroup').first();
    await ticketRadioGroup.getByText(type, { exact: true }).click();
    await this.page.waitForTimeout(1000);

    // If the first click didn't register (Radix RadioGroup quirk), retry
    const valueMap: Record<string, string> = {
      Free: 'free',
      Paid: 'paid',
      Donation: 'donation',
      'Pay Anything': 'pay_anything',
    };
    const radioButton = this.page.locator(
      `button[role="radio"][value="${valueMap[type]}"]`
    );
    const state = await radioButton.getAttribute('data-state');
    if (state !== 'checked') {
      // Retry with force click on the Radix radio button
      await radioButton.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
  }

  async fillTicketName(name: string) {
    await this.ticketNameInput.fill(name);
  }

  async fillTicketQuantity(quantity: string) {
    await this.ticketQuantityInput.fill(quantity);
  }

  async fillTicketPrice(price: string) {
    await this.ticketPriceInput.fill(price);
  }

  async fillTicketDescription(description: string) {
    await this.ticketDescriptionInput.fill(description);
  }

  async fillMinimumDonation(amount: string) {
    await this.minimumDonationInput.fill(amount);
  }

  async fillSuggestedAmount(amount: string) {
    await this.suggestedAmountInput.fill(amount);
  }

  async selectBaseFee() {
    // Click the parent container div which is the clickable plan card
    await this.baseFeeOption.locator('..').click();
  }

  async selectTakeOnCost() {
    // Click the parent container div which is the clickable plan card
    await this.takeOnCostOption.locator('..').click();
  }

  async clickPublish() {
    await this.publishButton.click();
    await this.page.waitForTimeout(2000);
  }

  /** Fill free ticket fields and publish. */
  async completeStep3WithFreeTicket(options: {
    ticketName: string;
    ticketQuantity: string;
    ticketDescription?: string;
  }) {
    await this.selectTicketType('Free');
    await this.fillTicketName(options.ticketName);
    await this.fillTicketQuantity(options.ticketQuantity);
    if (options.ticketDescription) {
      await this.fillTicketDescription(options.ticketDescription);
    }
    await this.clickPublish();
  }

  /** Fill paid ticket fields and publish. */
  async completeStep3WithPaidTicket(options: {
    ticketName: string;
    ticketQuantity: string;
    ticketPrice: string;
    ticketDescription?: string;
    plan?: 'base' | 'takeOnCost';
  }) {
    await this.selectTicketType('Paid');
    await this.fillTicketName(options.ticketName);
    await this.fillTicketQuantity(options.ticketQuantity);
    await this.fillTicketPrice(options.ticketPrice);
    if (options.ticketDescription) {
      await this.fillTicketDescription(options.ticketDescription);
    }
    if (options.plan === 'takeOnCost') {
      await this.selectTakeOnCost();
    } else {
      await this.selectBaseFee();
    }
    await this.clickPublish();
  }

  /** Fill donation ticket fields and publish. */
  async completeStep3WithDonationTicket(options: {
    ticketName: string;
    ticketQuantity: string;
    minimumDonation?: string;
    ticketDescription?: string;
  }) {
    await this.selectTicketType('Donation');
    await this.fillTicketName(options.ticketName);
    await this.fillTicketQuantity(options.ticketQuantity);
    if (options.minimumDonation) {
      await this.fillMinimumDonation(options.minimumDonation);
    }
    if (options.ticketDescription) {
      await this.fillTicketDescription(options.ticketDescription);
    }
    await this.clickPublish();
  }

  /** Fill pay-anything ticket fields and publish. */
  async completeStep3WithPayAnythingTicket(options: {
    ticketName: string;
    ticketQuantity: string;
    suggestedAmount?: string;
    ticketDescription?: string;
  }) {
    await this.selectTicketType('Pay Anything');
    await this.fillTicketName(options.ticketName);
    await this.fillTicketQuantity(options.ticketQuantity);
    if (options.suggestedAmount) {
      await this.fillSuggestedAmount(options.suggestedAmount);
    }
    if (options.ticketDescription) {
      await this.fillTicketDescription(options.ticketDescription);
    }
    await this.clickPublish();
  }

  // =====================================================================
  // Assertions
  // =====================================================================

  async expectToBeOnCreateEventPage() {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    await expect(this.page).toHaveURL(/\/events\/new/);
  }

  async expectStep1Visible() {
    await expect(this.imageUploadArea).toBeVisible({ timeout: 10000 });
    await expect(this.eventNameInput).toBeVisible();
  }

  async expectStep2Visible() {
    await expect(this.organizerInfoHeading).toBeVisible({ timeout: 10000 });
    await expect(this.organizerNameInput).toBeVisible();
    await expect(this.organizerAboutInput).toBeVisible();
  }

  async expectStep3Visible() {
    await expect(this.publishButton).toBeVisible({ timeout: 10000 });
    await expect(this.ticketNameInput).toBeVisible();
  }

  async expectNextButtonDisabled() {
    await expect(this.nextButton).toBeDisabled();
  }

  async expectNextButtonEnabled() {
    await expect(this.nextButton).toBeEnabled();
  }

  async expectPublishButtonEnabled() {
    await expect(this.publishButton).toBeEnabled();
  }

  async expectPublishButtonDisabled() {
    await expect(this.publishButton).toBeDisabled();
  }

  async expectOrganizerValidationErrors() {
    await expect(this.organizerRequiredError).toBeVisible();
    await expect(this.organizerAboutRequiredError).toBeVisible();
  }

  async expectRedirectToEventsPage() {
    await expect(this.page).toHaveURL(/\/events(\?.*)?$/, { timeout: 15000 });
  }

  async expectSuccessToast(message: string) {
    const toast = this.page.locator('li').filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  async expectErrorToast(message: string) {
    const toast = this.page.locator('li').filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  async expectCropModalVisible() {
    await expect(this.cropModalHeading).toBeVisible();
    await expect(this.cancelCropButton).toBeVisible();
    await expect(this.skipCropButton).toBeVisible();
    await expect(this.applyCropButton).toBeVisible();
  }

  async expectPrivateEventWarningVisible() {
    await expect(this.privateEventWarning).toBeVisible();
  }
}
