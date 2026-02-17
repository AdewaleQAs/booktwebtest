import { test, expect } from '../../fixtures';

test.describe('Sign In Page', () => {
  test.beforeEach(async ({ signInPage }) => {
    await signInPage.goto();
  });

  test.describe('Page Elements', () => {
    test('should display all sign-in form elements', async ({ signInPage }) => {
      await expect(signInPage.countryCodeSelect).toBeVisible();
      await expect(signInPage.phoneInput).toBeVisible();
      await expect(signInPage.emailInput).toBeVisible();
      await expect(signInPage.passwordInput).toBeVisible();
      await expect(signInPage.signInButton).toBeVisible();
      await expect(signInPage.signUpLink).toBeVisible();
      await expect(signInPage.forgotPasswordLink).toBeVisible();
    });

    test('should have correct default country code', async ({ signInPage }) => {
      await expect(signInPage.countryCodeSelect).toHaveValue('+1');
    });
  });

  test.describe('Form Validation', () => {
    test('should show error when submitting empty form', async ({ signInPage }) => {
      await signInPage.signInButton.click();
      await signInPage.expectErrorMessage('Please provide either phone number OR email and password');
    });

    test('should show error when only email is provided', async ({ signInPage }) => {
      await signInPage.emailInput.fill('test@example.com');
      await signInPage.signInButton.click();
      await signInPage.expectErrorMessage('Password is required');
    });

    test('should show error when only password is provided', async ({ signInPage }) => {
      await signInPage.passwordInput.fill('password123');
      await signInPage.signInButton.click();
      await signInPage.expectErrorMessage('Email is required');
    });

    test('should show error when phone AND email/password are provided', async ({ signInPage }) => {
      await signInPage.phoneInput.fill('1234567890');
      await signInPage.emailInput.fill('test@example.com');
      await signInPage.passwordInput.fill('password123');
      await signInPage.signInButton.click();
      await signInPage.expectErrorMessage('Please use either phone number OR email and password (not both)');
    });
  });

  test.describe('Phone Number Input', () => {
    test('should format US phone number correctly', async ({ signInPage }) => {
      await signInPage.countryCodeSelect.selectOption('+1');
      await signInPage.phoneInput.fill('7204227030');
      await expect(signInPage.phoneInput).toHaveValue('(720) 422-7030');
    });

    test('should format Nigerian phone number correctly', async ({ signInPage }) => {
      await signInPage.countryCodeSelect.selectOption('+234');
      await signInPage.phoneInput.fill('08031234567');
      await expect(signInPage.phoneInput).toHaveValue('0803 123 4567');
    });

    test('should only allow numeric input', async ({ signInPage }) => {
      await signInPage.phoneInput.fill('abc123def456');
      await expect(signInPage.phoneInput).toHaveValue('(123) 456');
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to sign up page', async ({ signInPage, page }) => {
      await signInPage.signUpLink.click();
      await expect(page).toHaveURL(/\/sign-up/);
    });

    test('should navigate to forgot password page', async ({ signInPage, page }) => {
      await signInPage.forgotPasswordLink.click();
      await expect(page).toHaveURL(/\/forgot-password/);
    });
  });
});