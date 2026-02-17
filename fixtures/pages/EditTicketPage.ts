import { Page, Locator, expect } from '@playwright/test';

export class EditTicketPage {
  readonly page: Page;

  // ---- Ticket List Page ----
  readonly heading: Locator;
  readonly addNewTicketButton: Locator;
  readonly emptyStateText: Locator;
  readonly createFirstTicketButton: Locator;

  // ---- Three-dot Menu Items ----
  readonly editMenuItem: Locator;
  readonly duplicateMenuItem: Locator;
  readonly deleteMenuItem: Locator;

  // ---- Create/Edit Ticket Form Headings ----
  readonly createTicketHeading: Locator;
  readonly editTicketHeading: Locator;
  readonly goBackButton: Locator;

  // ---- Ticket Form Fields ----
  readonly ticketNameInput: Locator;
  readonly ticketQuantityInput: Locator;
  readonly ticketDescriptionInput: Locator;
  readonly ticketPriceInput: Locator;
  readonly minimumDonationInput: Locator;
  readonly suggestedAmountInput: Locator;

  // ---- Ticket Type Radios (Radix RadioGroup) ----
  readonly freeTicketRadio: Locator;
  readonly paidTicketRadio: Locator;
  readonly donationTicketRadio: Locator;
  readonly payAnythingTicketRadio: Locator;

  // ---- Availability Radios ----
  readonly immediatelyRadio: Locator;
  readonly scheduleRadio: Locator;

  // ---- Toggles ----
  readonly setExpiryToggle: Locator;
  readonly restrictTicketsToggle: Locator;
  readonly approvalRequiredToggle: Locator;

  // ---- Action Buttons ----
  readonly cancelButton: Locator;
  readonly saveChangesButton: Locator;
  readonly createTicketSubmitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // ---- Ticket List Page ----
    // Note: The create/edit pages also show "Tickets" as a parent heading,
    // so use exact level=1 heading matching.
    this.heading = page.getByRole('heading', { name: 'Tickets', level: 1 });
    this.addNewTicketButton = page.getByRole('button', { name: 'Add a new ticket' });
    this.emptyStateText = page.getByText('No tickets yet');
    this.createFirstTicketButton = page.getByRole('button', { name: 'Create your first ticket' });

    // ---- Three-dot Menu Items (Radix DropdownMenu) ----
    this.editMenuItem = page.getByRole('menuitem', { name: 'Edit' });
    this.duplicateMenuItem = page.getByRole('menuitem', { name: 'Duplicate' });
    this.deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });

    // ---- Create/Edit Ticket Form Headings ----
    this.createTicketHeading = page.getByRole('heading', { name: 'Create New Ticket' });
    this.editTicketHeading = page.getByRole('heading', { name: 'Edit Ticket' });
    this.goBackButton = page.getByRole('button', { name: 'Go back to ticket page' });

    // ---- Ticket Form Fields ----
    // The placeholder on the ticket name input is "Enter ticket name" (NOT the label text above it)
    this.ticketNameInput = page.getByRole('textbox', { name: 'Enter ticket name' });
    this.ticketQuantityInput = page.getByRole('textbox', { name: 'Enter ticket quantity' });
    // Description placeholder varies by ticket type, use the role+name which is consistent
    this.ticketDescriptionInput = page.getByRole('textbox', { name: 'Ticket Description' });
    this.ticketPriceInput = page.getByRole('textbox', { name: 'Enter ticket price in $' });
    this.minimumDonationInput = page.getByRole('textbox', { name: 'Enter minimum donation in $' });
    this.suggestedAmountInput = page.getByRole('textbox', { name: 'Enter suggested amount in $' });

    // ---- Ticket Type Radios (Radix RadioGroup) ----
    this.freeTicketRadio = page.locator('button[role="radio"][value="free"]');
    this.paidTicketRadio = page.locator('button[role="radio"][value="paid"]');
    this.donationTicketRadio = page.locator('button[role="radio"][value="donation"]');
    this.payAnythingTicketRadio = page.locator('button[role="radio"][value="pay_anything"]');

    // ---- Availability Radios ----
    this.immediatelyRadio = page.getByText('Immediately', { exact: true });
    this.scheduleRadio = page.getByText('Schedule', { exact: true });

    // ---- Toggles ----
    this.setExpiryToggle = page.getByRole('button', {
      name: 'Set an expiry time and date?',
    });
    this.restrictTicketsToggle = page.getByRole('button', {
      name: 'Restrict number of tickets per guest?',
    });
    this.approvalRequiredToggle = page.getByRole('button', {
      name: 'Is approval required?',
    });

    // ---- Action Buttons ----
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });
    this.createTicketSubmitButton = page.getByRole('button', { name: 'Create Ticket' });
  }

  // =====================================================================
  // Navigation
  // =====================================================================

  /** Navigate to the ticket list page for a given event. */
  async gotoTicketList(eventId: number) {
    await this.page.goto(`/events/ticketsToEdit/${eventId}`);
    // Wait for the ticket list heading to appear
    await expect(this.heading).toBeVisible({ timeout: 15000 });
  }

  /** Navigate to the create ticket page for a given event. */
  async gotoCreateTicket(eventId: number) {
    await this.page.goto(`/events/${eventId}/ticket/create`);
    await expect(this.createTicketHeading).toBeVisible({ timeout: 15000 });
  }

  /** Navigate to the edit ticket page for a given event and ticket. */
  async gotoEditTicket(eventId: number, ticketId: number) {
    await this.page.goto(`/events/${eventId}/ticket/edit/${ticketId}`);
    await expect(this.editTicketHeading).toBeVisible({ timeout: 15000 });
  }

  /** Click "Add a new ticket" button on the ticket list page. */
  async clickAddNewTicket() {
    await this.addNewTicketButton.click();
    await expect(this.createTicketHeading).toBeVisible({ timeout: 15000 });
  }

  /** Click "Create your first ticket" button on empty state. */
  async clickCreateFirstTicket() {
    await this.createFirstTicketButton.click();
    await expect(this.createTicketHeading).toBeVisible({ timeout: 15000 });
  }

  /** Click "Go back to ticket page" button on create/edit page. */
  async clickGoBack() {
    await this.goBackButton.click();
    await this.page.waitForTimeout(2000);
  }

  // =====================================================================
  // Ticket Card Helpers
  // =====================================================================

  /**
   * Open the three-dot menu for a specific ticket.
   * The ticket card is a button element containing the ticket name and info.
   * Inside it, there's an inner button (with just an SVG icon) that triggers
   * the Radix DropdownMenu.
   */
  async openTicketMenu(ticketName: string) {
    // Each ticket card is a large button containing the ticket name text.
    // Inside the card, there's a small inner button with an SVG icon (⋮)
    // that triggers the dropdown. We locate the card by name then find the trigger.
    const card = this.page.getByRole('button', { name: new RegExp(ticketName) });
    // The three-dot trigger is a nested button inside the card.
    // It's the only nested button inside the ticket card.
    const menuTrigger = card.locator('button');
    await menuTrigger.click();
    await this.page.waitForTimeout(500);
    // Wait for the dropdown menu to appear
    await expect(this.editMenuItem).toBeVisible({ timeout: 5000 });
  }

  /** Click the Edit option from the three-dot dropdown menu. */
  async clickEdit() {
    await this.editMenuItem.click();
    await expect(this.editTicketHeading).toBeVisible({ timeout: 15000 });
  }

  /** Click the Duplicate option from the three-dot dropdown menu. */
  async clickDuplicate() {
    await this.duplicateMenuItem.click();
    await this.page.waitForTimeout(2000);
  }

  /** Click the Delete option from the three-dot dropdown menu. */
  async clickDelete() {
    await this.deleteMenuItem.click();
    await this.page.waitForTimeout(2000);
  }

  // =====================================================================
  // Form Interactions
  // =====================================================================

  /** Select a ticket type in the Radix RadioGroup. Includes retry logic. */
  async selectTicketType(type: 'Free' | 'Paid' | 'Donation' | 'Pay Anything') {
    // Click the label text within the ticket type radiogroup
    const ticketRadioGroup = this.page.getByRole('radiogroup').first();
    await ticketRadioGroup.getByText(type, { exact: true }).click();
    await this.page.waitForTimeout(1000);

    // Radix RadioGroup retry pattern
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
      await radioButton.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
  }

  async fillTicketName(name: string) {
    await this.ticketNameInput.clear();
    await this.ticketNameInput.fill(name);
  }

  async fillTicketQuantity(quantity: string) {
    await this.ticketQuantityInput.clear();
    await this.ticketQuantityInput.fill(quantity);
  }

  async fillTicketPrice(price: string) {
    await this.ticketPriceInput.clear();
    await this.ticketPriceInput.fill(price);
  }

  async fillTicketDescription(description: string) {
    await this.ticketDescriptionInput.clear();
    await this.ticketDescriptionInput.fill(description);
  }

  async fillMinimumDonation(amount: string) {
    await this.minimumDonationInput.clear();
    await this.minimumDonationInput.fill(amount);
  }

  async fillSuggestedAmount(amount: string) {
    await this.suggestedAmountInput.clear();
    await this.suggestedAmountInput.fill(amount);
  }

  /** Click the "Create Ticket" submit button. */
  async clickCreateTicketButton() {
    await this.createTicketSubmitButton.click();
    await this.page.waitForTimeout(2000);
  }

  /** Click the "Save Changes" button on the edit ticket page. */
  async clickSaveChanges() {
    await this.saveChangesButton.click();
    await this.page.waitForTimeout(2000);
  }

  /** Click the "Cancel" button on create/edit ticket page. */
  async clickCancel() {
    await this.cancelButton.click();
    await this.page.waitForTimeout(1000);
  }

  // =====================================================================
  // Complete Flows
  // =====================================================================

  /** Create a free ticket with the given name and quantity. */
  async createFreeTicket(name: string, quantity: string) {
    await this.selectTicketType('Free');
    await this.fillTicketName(name);
    await this.fillTicketQuantity(quantity);
    await this.clickCreateTicketButton();
  }

  /** Create a paid ticket with the given name, quantity, and price. */
  async createPaidTicket(name: string, quantity: string, price: string) {
    await this.selectTicketType('Paid');
    await this.fillTicketName(name);
    await this.fillTicketQuantity(quantity);
    await this.fillTicketPrice(price);
    await this.clickCreateTicketButton();
  }

  // =====================================================================
  // Assertions
  // =====================================================================

  async expectOnTicketListPage() {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    await expect(this.page).toHaveURL(/\/events\/ticketsToEdit\//);
  }

  async expectOnCreateTicketPage() {
    await expect(this.createTicketHeading).toBeVisible({ timeout: 15000 });
    await expect(this.page).toHaveURL(/\/ticket\/create/);
  }

  async expectOnEditTicketPage() {
    await expect(this.editTicketHeading).toBeVisible({ timeout: 15000 });
    await expect(this.page).toHaveURL(/\/ticket\/edit\//);
  }

  /** Assert a ticket card with the given name is visible on the list page. */
  async expectTicketVisible(name: string) {
    await expect(this.page.getByText(name).first()).toBeVisible({ timeout: 10000 });
  }

  /** Assert a ticket card with the given name is NOT visible on the list page. */
  async expectTicketNotVisible(name: string) {
    await expect(this.page.getByText(name)).not.toBeVisible({ timeout: 10000 });
  }

  /** Assert a success toast message appears. */
  async expectSuccessToast(message: string) {
    const toast = this.page.locator('li').filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  /** Assert an error toast message appears. */
  async expectErrorToast(message: string) {
    const toast = this.page.locator('li').filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 10000 });
  }
}
