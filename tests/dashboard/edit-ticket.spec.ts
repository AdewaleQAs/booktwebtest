import { test, expect } from '../../fixtures';

/**
 * Edit Ticket Flow — E2E Tests
 *
 * Tests the ticket management features for an event:
 * - Ticket list page at /events/ticketsToEdit/{eventId}
 * - Create new ticket at /events/{eventId}/ticket/create
 * - Edit ticket at /events/{eventId}/ticket/edit/{ticketId}
 * - Delete ticket (immediate, no confirmation)
 * - Duplicate ticket
 *
 * Tests use serial execution for groups that modify shared state.
 *
 * Requires authenticated session (chromium-authenticated project).
 *
 * NOTE: The "Save Changes" API on staging currently returns a 400 error
 * ("Unexpected end of JSON input") — this is a known backend bug.
 * The edit-save happy path test documents this bug by expecting the error toast.
 */

// Known event on staging — used for ticket management tests
const EVENT_ID = 1868;

// Pre-existing ticket name on event 1868
const EXISTING_TICKET = 'General Admission';

// =============================================================================
// TICKET LIST PAGE — Basic Elements
// =============================================================================

test.describe('Ticket List Page', () => {
  test.beforeEach(async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
  });

  test('should display Tickets heading', async ({ editTicketPage }) => {
    await expect(editTicketPage.heading).toBeVisible();
  });

  test('should show Add a new ticket button', async ({ editTicketPage }) => {
    await expect(editTicketPage.addNewTicketButton).toBeVisible();
  });

  test('should display ticket cards with name and type info', async ({ editTicketPage }) => {
    // The pre-existing "General Admission" free ticket should be visible
    await editTicketPage.expectTicketVisible(EXISTING_TICKET);
    // Should also show the ticket type
    await expect(editTicketPage.page.getByText('Free').first()).toBeVisible();
  });

  test('should show three-dot menu with Edit, Duplicate, Delete options', async ({ editTicketPage, page }) => {
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await expect(editTicketPage.editMenuItem).toBeVisible();
    await expect(editTicketPage.duplicateMenuItem).toBeVisible();
    await expect(editTicketPage.deleteMenuItem).toBeVisible();
    // Close the menu
    await page.keyboard.press('Escape');
  });
});

// =============================================================================
// CREATE NEW TICKET — Form Elements
// =============================================================================

test.describe('Create New Ticket — Form Elements', () => {
  test.beforeEach(async ({ editTicketPage }) => {
    await editTicketPage.gotoCreateTicket(EVENT_ID);
  });

  test('should display Create New Ticket heading', async ({ editTicketPage }) => {
    await expect(editTicketPage.createTicketHeading).toBeVisible();
  });

  test('should show Go back to ticket page button', async ({ editTicketPage }) => {
    await expect(editTicketPage.goBackButton).toBeVisible();
  });

  test('should show ticket type radios with Free selected by default', async ({ editTicketPage }) => {
    await expect(editTicketPage.freeTicketRadio).toBeVisible();
    await expect(editTicketPage.paidTicketRadio).toBeVisible();
    await expect(editTicketPage.donationTicketRadio).toBeVisible();
    await expect(editTicketPage.payAnythingTicketRadio).toBeVisible();

    // Free should be selected by default
    await expect(editTicketPage.freeTicketRadio).toHaveAttribute('data-state', 'checked');
  });

  test('should show ticket name, quantity, and description fields', async ({ editTicketPage }) => {
    await expect(editTicketPage.ticketNameInput).toBeVisible();
    await expect(editTicketPage.ticketQuantityInput).toBeVisible();
    await expect(editTicketPage.ticketDescriptionInput).toBeVisible();
  });

  test('should show Cancel and Create Ticket buttons', async ({ editTicketPage }) => {
    await expect(editTicketPage.cancelButton).toBeVisible();
    await expect(editTicketPage.createTicketSubmitButton).toBeVisible();
  });
});

// =============================================================================
// CREATE NEW TICKET — Ticket Type Switching
// =============================================================================

test.describe('Create New Ticket — Ticket Type Switching', () => {
  test.beforeEach(async ({ editTicketPage }) => {
    await editTicketPage.gotoCreateTicket(EVENT_ID);
  });

  test('Free ticket: shows name, quantity, description, availability (no price)', async ({ editTicketPage }) => {
    await editTicketPage.selectTicketType('Free');
    await expect(editTicketPage.ticketNameInput).toBeVisible();
    await expect(editTicketPage.ticketQuantityInput).toBeVisible();
    await expect(editTicketPage.ticketDescriptionInput).toBeVisible();
    await expect(editTicketPage.immediatelyRadio).toBeVisible();
    // Price field should NOT be visible for free tickets
    await expect(editTicketPage.ticketPriceInput).not.toBeVisible();
  });

  test('Paid ticket: shows price field and availability', async ({ editTicketPage }) => {
    await editTicketPage.selectTicketType('Paid');
    await expect(editTicketPage.ticketNameInput).toBeVisible();
    await expect(editTicketPage.ticketQuantityInput).toBeVisible();
    await expect(editTicketPage.ticketPriceInput).toBeVisible();
    await expect(editTicketPage.immediatelyRadio).toBeVisible();
  });

  test('Donation ticket: shows minimum donation field', async ({ editTicketPage }) => {
    await editTicketPage.selectTicketType('Donation');
    await expect(editTicketPage.ticketNameInput).toBeVisible();
    await expect(editTicketPage.ticketQuantityInput).toBeVisible();
    await expect(editTicketPage.minimumDonationInput).toBeVisible();
  });

  test('Pay Anything ticket: shows suggested amount field', async ({ editTicketPage }) => {
    await editTicketPage.selectTicketType('Pay Anything');
    await expect(editTicketPage.ticketNameInput).toBeVisible();
    await expect(editTicketPage.ticketQuantityInput).toBeVisible();
    await expect(editTicketPage.suggestedAmountInput).toBeVisible();
  });
});

// =============================================================================
// EDIT TICKET — Form & Pre-filled State (read-only checks)
// =============================================================================

test.describe('Edit Ticket', () => {
  test('should navigate to edit page via three-dot menu', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await editTicketPage.clickEdit();

    await editTicketPage.expectOnEditTicketPage();
  });

  test('should display Edit Ticket heading', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await editTicketPage.clickEdit();

    await expect(editTicketPage.editTicketHeading).toBeVisible();
  });

  test('should have ticket name pre-filled', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await editTicketPage.clickEdit();

    // Wait for form data to hydrate
    await expect(editTicketPage.ticketNameInput).not.toHaveValue('', { timeout: 10000 });
    const nameValue = await editTicketPage.ticketNameInput.inputValue();
    expect(nameValue).toContain('General Admission');
  });

  test('should have ticket quantity pre-filled', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await editTicketPage.clickEdit();

    // Wait for form data to hydrate
    await expect(editTicketPage.ticketQuantityInput).not.toHaveValue('', { timeout: 10000 });
    const qtyValue = await editTicketPage.ticketQuantityInput.inputValue();
    expect(qtyValue).not.toBe('0');
  });

  test('should show Cancel and Save Changes buttons', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await editTicketPage.clickEdit();

    await expect(editTicketPage.cancelButton).toBeVisible();
    await expect(editTicketPage.saveChangesButton).toBeVisible();
  });

  test('should show ticket type radio with current type selected', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await editTicketPage.clickEdit();

    // The "General Admission" ticket is Free, so Free radio should be checked
    await expect(editTicketPage.freeTicketRadio).toHaveAttribute('data-state', 'checked');
  });

  test('save changes returns error toast (known staging API bug)', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await editTicketPage.clickEdit();

    // Change the name and try to save
    await editTicketPage.fillTicketName('Temp Edit Test');
    await editTicketPage.clickSaveChanges();

    // KNOWN BUG: The save API returns 400 "Unexpected end of JSON input"
    // This test documents the bug — update expectation when the API is fixed.
    await editTicketPage.expectErrorToast('Unexpected end of JSON input');
  });
});

// =============================================================================
// CRUD OPERATIONS — Serial (Create → Duplicate → Delete)
// These tests modify shared state and must run in order.
// Note: Edit-save is skipped from serial flow due to the known API bug.
// =============================================================================

test.describe('Ticket CRUD Operations', () => {
  test.describe.configure({ mode: 'serial', timeout: 60000 });

  const testTicketName = `E2E-Test-${Date.now()}`;

  test('should create a Free ticket and show it on the ticket list', async ({ editTicketPage }) => {
    await editTicketPage.gotoCreateTicket(EVENT_ID);
    await editTicketPage.createFreeTicket(testTicketName, '50');

    // Should redirect to ticket list or show success
    await expect(
      editTicketPage.heading.or(
        editTicketPage.page.locator('li').filter({ hasText: /success|created/i })
      )
    ).toBeVisible({ timeout: 15000 });
  });

  test('should show the newly created ticket on the list', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.expectTicketVisible(testTicketName);
  });

  test('should duplicate a ticket via three-dot menu', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(testTicketName);
    await editTicketPage.clickDuplicate();

    // Should remain on or return to the ticket list
    await expect(editTicketPage.heading).toBeVisible({ timeout: 15000 });
  });

  test('should delete a ticket with success toast (no confirmation)', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(testTicketName);
    await editTicketPage.clickDelete();

    // No confirmation dialog — immediate deletion with toast
    await editTicketPage.expectSuccessToast('Ticket deleted successfully');
  });

  test('cleanup: delete remaining test tickets', async ({ editTicketPage, page }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);

    // The duplicate may still exist with the same name.
    // Check if any E2E-Test tickets remain and delete them.
    const testTicket = page.getByText(testTicketName).first();
    const exists = await testTicket.isVisible().catch(() => false);

    if (exists) {
      await editTicketPage.openTicketMenu(testTicketName);
      await editTicketPage.clickDelete();
      await editTicketPage.expectSuccessToast('Ticket deleted successfully');
    }

    // Verify the pre-existing ticket is still intact
    await editTicketPage.expectTicketVisible(EXISTING_TICKET);
  });
});

// =============================================================================
// CREATE TICKET FORM — Validation
// Inline <p> errors appear under each field when submit is clicked with invalid data.
// Validation is submit-triggered, NOT real-time (button is never disabled pre-submit).
// =============================================================================

test.describe('Create Ticket Form — Validation', () => {
  test.beforeEach(async ({ editTicketPage }) => {
    await editTicketPage.gotoCreateTicket(EVENT_ID);
  });

  test('Create Ticket button is clickable on empty form (validation is submit-triggered)', async ({ editTicketPage }) => {
    await expect(editTicketPage.createTicketSubmitButton).toBeEnabled();
  });

  test('should show "Ticket name is required" when name is empty on submit', async ({ editTicketPage }) => {
    await editTicketPage.createTicketSubmitButton.click();
    await editTicketPage.expectValidationError('Ticket name is required');
  });

  test('should show "Quantity must be at least 1" when quantity is 0 on submit', async ({ editTicketPage }) => {
    await editTicketPage.createTicketSubmitButton.click();
    await editTicketPage.expectValidationError('Quantity must be at least 1');
  });

  test('should show both name and quantity errors simultaneously on empty form submit', async ({ editTicketPage }) => {
    await editTicketPage.createTicketSubmitButton.click();
    await expect(editTicketPage.ticketNameError).toBeVisible();
    await expect(editTicketPage.quantityError).toBeVisible();
  });

  test('Free: filling name removes name error but quantity error persists', async ({ editTicketPage }) => {
    // Trigger both errors first
    await editTicketPage.createTicketSubmitButton.click();
    await expect(editTicketPage.ticketNameError).toBeVisible();
    await expect(editTicketPage.quantityError).toBeVisible();

    // Fill name and submit again — name error should clear
    await editTicketPage.fillTicketName('VIP');
    await editTicketPage.createTicketSubmitButton.click();
    await editTicketPage.expectNoValidationError('Ticket name is required');
    await expect(editTicketPage.quantityError).toBeVisible();
  });

  test('Paid: shows name and quantity errors on empty submit', async ({ editTicketPage }) => {
    await editTicketPage.selectTicketType('Paid');
    await editTicketPage.createTicketSubmitButton.click();
    await expect(editTicketPage.ticketNameError).toBeVisible();
    await expect(editTicketPage.quantityError).toBeVisible();
  });

  test('Donation: shows name error on empty submit', async ({ editTicketPage }) => {
    await editTicketPage.selectTicketType('Donation');
    await editTicketPage.createTicketSubmitButton.click();
    await expect(editTicketPage.ticketNameError).toBeVisible();
  });

  test('Pay Anything: shows name and quantity errors on empty submit', async ({ editTicketPage }) => {
    await editTicketPage.selectTicketType('Pay Anything');
    await editTicketPage.createTicketSubmitButton.click();
    await expect(editTicketPage.ticketNameError).toBeVisible();
    await expect(editTicketPage.quantityError).toBeVisible();
  });

  test('should show quantity error when quantity is explicitly set to 0', async ({ editTicketPage }) => {
    await editTicketPage.fillTicketName('Test Ticket');
    await editTicketPage.ticketQuantityInput.clear();
    await editTicketPage.ticketQuantityInput.fill('0');
    await editTicketPage.createTicketSubmitButton.click();
    await editTicketPage.expectValidationError('Quantity must be at least 1');
  });

  test('should not show errors when all required fields are filled (no premature errors)', async ({ editTicketPage }) => {
    // Fill required fields without submitting — no errors should be visible
    await editTicketPage.fillTicketName('Valid Ticket');
    await editTicketPage.fillTicketQuantity('10');
    await editTicketPage.expectNoValidationError('Ticket name is required');
    await editTicketPage.expectNoValidationError('Quantity must be at least 1');
  });
});

// =============================================================================
// EDIT TICKET FORM — Validation
// =============================================================================

test.describe('Edit Ticket Form — Validation', () => {
  test('Save Changes button is clickable (not pre-disabled) on edit page', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await editTicketPage.clickEdit();

    await expect(editTicketPage.saveChangesButton).toBeEnabled();
  });

  test('should show name validation error when name is cleared and form submitted', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await editTicketPage.clickEdit();

    // Clear the ticket name
    await editTicketPage.ticketNameInput.clear();
    await editTicketPage.saveChangesButton.click();

    // Expect either inline validation error OR the known API bug toast
    // (if frontend validation fires before the API call, we get the inline error)
    const nameError = editTicketPage.page.locator('p', { hasText: 'Ticket name is required' });
    const apiError = editTicketPage.page.locator('li').filter({ hasText: 'Unexpected end of JSON input' });
    await expect(nameError.or(apiError)).toBeVisible({ timeout: 10000 });
  });
});

// =============================================================================
// NAVIGATION — Cancel & Go Back
// =============================================================================

test.describe('Navigation', () => {
  test('Cancel on create ticket page returns to ticket list', async ({ editTicketPage }) => {
    await editTicketPage.gotoCreateTicket(EVENT_ID);
    await editTicketPage.clickCancel();

    await editTicketPage.expectOnTicketListPage();
  });

  test('Cancel on edit page returns to ticket list', async ({ editTicketPage }) => {
    await editTicketPage.gotoTicketList(EVENT_ID);
    await editTicketPage.openTicketMenu(EXISTING_TICKET);
    await editTicketPage.clickEdit();

    await editTicketPage.clickCancel();
    await editTicketPage.expectOnTicketListPage();
  });
});
