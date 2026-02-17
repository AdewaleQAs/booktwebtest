import { test, expect } from '../../fixtures';

test.describe('Email Sign In Flow', () => {
  test.beforeEach(async ({ signInPage }) => {
    await signInPage.goto();
  });

  test.describe('Email/Password Validation', () => {
    test('should show error for short password', async ({ signInPage }) => {
      await signInPage.emailInput.fill('test@example.com');
      await signInPage.passwordInput.fill('12345');
      await signInPage.signInButton.click();
      await signInPage.expectErrorMessage('Password must be at least 6 characters');
    });

    test('should not submit form with invalid email format', async ({ signInPage }) => {
      // HTML5 email validation prevents form submission — no inline error shown
      await signInPage.emailInput.fill('invalid-email');
      await signInPage.passwordInput.fill('password123456');
      await signInPage.signInButton.click();
      // Should remain on sign-in page without any API call
      await signInPage.expectToBeOnSignInPage();
    });
  });

  test.describe('Sign In Attempts', () => {
    test('should show error toast for invalid credentials', async ({ signInPage }) => {
      await signInPage.signInWithEmail('wrong@example.com', 'wrongpassword123');
      await signInPage.expectErrorToast('The email or password you entered is incorrect');
    });

    test('should show success overlay on valid login', async ({ signInPage }) => {
      const email = process.env.TEST_USER_EMAIL || 't.adewale@getbookt.io';
      const password = process.env.TEST_USER_PASSWORD || 'Damilare@26';

      await signInPage.signInWithEmail(email, password);
      await signInPage.expectSuccessOverlay();
    });

    test('should redirect to dashboard after successful login', async ({ signInPage, page }) => {
      const email = process.env.TEST_USER_EMAIL || 't.adewale@getbookt.io';
      const password = process.env.TEST_USER_PASSWORD || 'Damilare@26';

      await signInPage.signInWithEmail(email, password);
      await signInPage.expectSuccessOverlay();
      await signInPage.expectRedirectToDashboard();
    });

    test('should disable form inputs during sign-in loading', async ({ signInPage }) => {
      const email = process.env.TEST_USER_EMAIL || 't.adewale@getbookt.io';
      const password = process.env.TEST_USER_PASSWORD || 'Damilare@26';

      await signInPage.signInWithEmail(email, password);
      await signInPage.expectFormDisabledDuringLoading();
    });
  });
});
