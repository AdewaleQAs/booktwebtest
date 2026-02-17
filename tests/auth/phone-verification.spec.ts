import { test, expect } from '../../fixtures';

test.describe('Phone Verification Flow', () => {
  test.beforeEach(async ({ signInPage }) => {
    await signInPage.goto();
  });

  test.describe('Phone Sign In Attempts', () => {
    test('should show error toast for unverified phone number', async ({ signInPage }) => {
      await signInPage.signInWithPhone('7204227030', '+1');
      await signInPage.expectErrorToast('You are not verified please signUp');
    });

    test('should show error toast for unverified Nigerian phone number', async ({ signInPage }) => {
      await signInPage.signInWithPhone('8031234567', '+234');
      await signInPage.expectErrorToast('You are not verified please signUp');
    });

    test('should remain on sign-in page after phone sign-in error', async ({ signInPage }) => {
      await signInPage.signInWithPhone('7204227030', '+1');
      await signInPage.expectErrorToast('You are not verified please signUp');
      await signInPage.expectToBeOnSignInPage();
    });
  });

  test.describe('Verification Modal', () => {
    // Note: These tests require a verified phone number that triggers the OTP flow.
    // The phone number must be registered and verified in the system.
    // Currently, unverified phones get an error toast instead of the verification modal.

    test.skip('should show verification modal after entering verified phone', async ({
      signInPage,
      verificationModal,
    }) => {
      // Requires a phone number that is verified in the system
      await signInPage.signInWithPhone('VERIFIED_PHONE_HERE');
      await verificationModal.expectToBeVisible();
    });

    test.skip('should show cooldown timer after OTP is sent', async ({
      signInPage,
      verificationModal,
    }) => {
      await signInPage.signInWithPhone('VERIFIED_PHONE_HERE');
      await verificationModal.expectToBeVisible();
      await verificationModal.expectCooldownVisible();
    });

    test.skip('should allow going back to sign in form', async ({
      signInPage,
      verificationModal,
    }) => {
      await signInPage.signInWithPhone('VERIFIED_PHONE_HERE');
      await verificationModal.expectToBeVisible();
      await verificationModal.goBack();
      await signInPage.expectToBeOnSignInPage();
    });

    test.skip('should enable verify button only with 4 digits', async ({
      signInPage,
      verificationModal,
    }) => {
      await signInPage.signInWithPhone('VERIFIED_PHONE_HERE');
      await verificationModal.expectToBeVisible();
      await expect(verificationModal.verifyButton).toBeDisabled();
      await verificationModal.enterOtp('1234');
      await expect(verificationModal.verifyButton).toBeEnabled();
    });
  });
});
